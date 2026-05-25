import { Types } from "mongoose";
import { ChannelJoinRequestDAO } from "../dao/ChannelJoinRequestDAO";
import { ChannelMemberService } from "./ChannelMember.service";
import { PermissionService } from "./Permission.service";
import Channel from "../models/Channel.model";
import ChannelJoinRequest from "../models/ChannelJoinRequest.model";
import { realtimeBus } from "../utils/realtime";
import { NotificationService } from "./Notification.service";

const requestDAO = new ChannelJoinRequestDAO();

const getWorkspaceNotificationRecipients = async (workspaceId: string) => {
  const Workspace = (await import("../models/Workspace.model")).default;

  const workspace = await Workspace.findById(workspaceId)
    .select("ownerId members")
    .lean();

  if (!workspace) return [] as string[];

  const userIds = new Set<string>();

  if (workspace.ownerId) {
    userIds.add(String(workspace.ownerId));
  }

  const members = Array.isArray(workspace.members) ? workspace.members : [];

  members.forEach((member: any) => {
    if (member?.role === "owner" || member?.role === "admin") {
      const memberUserId = member?.userId ?? member?._id;

      if (memberUserId) {
        userIds.add(String(memberUserId));
      }
    }
  });

  return Array.from(userIds);
};
export class ChannelJoinRequestService {
  /**
   * User request to join a private channel.
   * Checks: channel is private, user is not already member, no pending request exists.
   */
  static async createRequest(params: {
    channelId: string;
    userId: string;
    message?: string;
  }) {
    const { channelId, userId, message } = params;

    // 1. Get channel and check type
    const channel = await Channel.findById(channelId)
      .select("type workspaceId members isArchived")
      .lean();
    if (!channel) {
      throw Object.assign(new Error("Channel not found"), { status: 404 });
    }

    if (channel.isArchived) {
      throw Object.assign(
        new Error("Cannot request to join archived channel"),
        {
          status: 400,
        },
      );
    }

    // 2. Check user is not already member
    const isMember = channel.members.some((m: any) => m.toString() === userId);
    if (isMember) {
      throw Object.assign(
        new Error("You are already a member of this channel"),
        {
          status: 400,
        },
      );
    }

    // 2b. Ensure the user is a member of the workspace containing this channel
    const Workspace = (await import("../models/Workspace.model")).default;
    const workspace = await Workspace.findById(channel.workspaceId)
      .select("ownerId members")
      .lean();
    if (!workspace) {
      throw Object.assign(new Error("Workspace not found"), { status: 404 });
    }

    const isWorkspaceOwner = workspace.ownerId?.toString?.() === userId;
    const isWorkspaceMember =
      Array.isArray(workspace.members) &&
      workspace.members.some(
        (m: any) => m.userId?.toString() === userId || m.toString() === userId,
      );
    if (!isWorkspaceOwner && !isWorkspaceMember) {
      throw Object.assign(
        new Error("Forbidden: you are not a member of the workspace"),
        { status: 403 },
      );
    }

    // 3. For public channels, auto-add user (no request needed)
    if (channel.type === "public") {
      return {
        message: "Auto-joined public channel",
        autoJoined: true,
      };
    }

    // 4. For private channels, check if request already pending
    const existing = await requestDAO.findByChannelAndUser(channelId, userId);
    if (existing && existing.status === "pending") {
      throw Object.assign(
        new Error("You already have a pending request for this channel"),
        { status: 400 },
      );
    }

    // 5. Create request
    const request = await requestDAO.create({
      channelId: new Types.ObjectId(channelId),
      workspaceId: new Types.ObjectId(channel.workspaceId),
      senderId: new Types.ObjectId(userId),
      type: "request",
      status: "pending",
      message: message?.trim() || "",
    } as any);

    // 6. Emit realtime event
    realtimeBus.emitEvent("join_request:new", {
      requestId: request._id,
      channelId,
      userId,
      message,
    });

    const recipients = await getWorkspaceNotificationRecipients(
      String(channel.workspaceId),
    );
    const senderUser = await Channel.db
      .collection("users")
      .findOne(
        { _id: new Types.ObjectId(userId) },
        { projection: { name: 1, email: 1 } },
      );

    await NotificationService.createManyNotifications(
      recipients
        .filter((recipientId) => recipientId !== userId)
        .map((recipientId) => ({
          userId: recipientId,
          workspaceId: String(channel.workspaceId),
          type: "join_request",
          title: "New channel join request",
          description: `${senderUser?.name || senderUser?.email || "A member"} requested to join a private channel`,
          relatedUserId: userId,
          relatedChannelId: channelId,
          relatedRequestId: String(request._id),
        })),
    );

    return {
      success: true,
      data: request,
      message: "Request sent to channel admins",
    };
  }

  /**
   * Approve a pending request.
   * Admin/owner of workspace can approve.
   * Adds user to channel and updates request status.
   */
  static async approveRequest(params: { requestId: string; userId: string }) {
    const { requestId, userId } = params;

    // 1. Get request
    const request = await requestDAO.findById(requestId);
    if (!request) {
      throw Object.assign(new Error("Request not found"), { status: 404 });
    }

    if (request.status !== "pending") {
      throw Object.assign(
        new Error(
          `Cannot approve non-pending request (status: ${request.status})`,
        ),
        { status: 400 },
      );
    }

    // 2. Check approver is workspace owner/admin
    const canApprove = await PermissionService.canApproveRequest(
      userId,
      request.channelId.toString(),
    );
    if (!canApprove) {
      throw Object.assign(
        new Error("Forbidden: only workspace owner/admin can approve requests"),
        { status: 403 },
      );
    }

    // 3. Add user to channel
    const channel = await Channel.findById(request.channelId)
      .select("workspaceId")
      .lean();
    if (!channel) {
      throw Object.assign(new Error("Channel not found"), { status: 404 });
    }

    await ChannelMemberService.addMember(
      request.channelId.toString(),
      request.senderId.toString(),
      channel.workspaceId.toString(),
      "member",
    );

    // 4. Update request status
    const updated = await requestDAO.updateStatus(requestId, "accepted");

    // 5. Emit realtime event
    realtimeBus.emitEvent("join_request:approved", {
      requestId,
      channelId: request.channelId,
      userId: request.senderId,
    });

    await NotificationService.createNotification({
      userId: String(request.senderId),
      workspaceId: String(channel.workspaceId),
      type: "request_approved",
      title: "Your join request was approved",
      description: "You can now enter the channel.",
      relatedUserId: userId,
      relatedChannelId: String(request.channelId),
      relatedRequestId: requestId,
    });

    return {
      success: true,
      data: updated,
      message: "Request approved. User added to channel.",
    };
  }

  /**
   * Reject a pending request.
   * Admin/owner of workspace can reject.
   */
  static async rejectRequest(params: {
    requestId: string;
    userId: string;
    reason?: string;
  }) {
    const { requestId, userId, reason } = params;

    // 1. Get request
    const request = await requestDAO.findById(requestId);
    if (!request) {
      throw Object.assign(new Error("Request not found"), { status: 404 });
    }

    if (request.status !== "pending") {
      throw Object.assign(
        new Error(
          `Cannot reject non-pending request (status: ${request.status})`,
        ),
        { status: 400 },
      );
    }

    // 2. Check approver is workspace owner/admin
    const canApprove = await PermissionService.canApproveRequest(
      userId,
      request.channelId.toString(),
    );
    if (!canApprove) {
      throw Object.assign(
        new Error("Forbidden: only workspace owner/admin can reject requests"),
        { status: 403 },
      );
    }

    // 3. Update request status
    const updated = await requestDAO.updateStatus(requestId, "rejected");

    // 4. Emit realtime event
    realtimeBus.emitEvent("join_request:rejected", {
      requestId,
      channelId: request.channelId,
      userId: request.senderId,
      reason,
    });

    await NotificationService.createNotification({
      userId: String(request.senderId),
      workspaceId: String(request.workspaceId),
      type: "join_request",
      title: "Your join request was rejected",
      description: reason?.trim() || "Your request was rejected by an admin.",
      relatedUserId: userId,
      relatedChannelId: String(request.channelId),
      relatedRequestId: requestId,
    });

    return {
      success: true,
      data: updated,
      message: "Request rejected.",
    };
  }

  /**
   * Get all pending requests for a channel.
   * Only workspace owner/admin can view.
   */
  static async getPendingRequests(params: {
    channelId: string;
    userId: string;
    page?: number;
    limit?: number;
  }) {
    const { channelId, userId, page = 1, limit = 20 } = params;

    // Check permission
    const canApprove = await PermissionService.canApproveRequest(
      userId,
      channelId,
    );
    if (!canApprove) {
      throw Object.assign(
        new Error("Forbidden: only workspace owner/admin can view requests"),
        { status: 403 },
      );
    }

    const result = await requestDAO.findByChannel(channelId, {
      status: "pending",
      page,
      limit,
    });

    return result;
  }

  /**
   * Get pending requests received by a specific user (user's inbox).
   */
  static async getMyPendingRequests(userId: string) {
    const requests = await requestDAO.findPendingForUser(userId);
    return {
      success: true,
      data: requests,
      count: requests.length,
    };
  }

  /**
   * Get latest request status per channel sent by current user.
   */
  static async getMyRequests(userId: string) {
    const requests = await requestDAO.findLatestBySender(userId);
    return {
      success: true,
      data: requests,
      count: requests.length,
    };
  }
}
