import Workspace from "../models/Workspace.model";
import Channel from "../models/Channel.model";
import ChannelMember from "../models/ChannelMember.model";
import ChannelJoinRequest from "../models/ChannelJoinRequest.model";
import { Types } from "mongoose";

export class PermissionService {
  static async isWorkspaceOwnerOrAdmin(
    userId: string,
    workspaceId: string,
  ): Promise<boolean> {
    const workspace = await Workspace.findById(workspaceId)
      .select("ownerId members")
      .lean();
    if (!workspace) return false;

    if (workspace.ownerId.toString() === userId) return true;

    const isWorkspaceMember = (workspace.members || []).some(
      (m: any) => m.toString() === userId,
    );
    if (!isWorkspaceMember || !Types.ObjectId.isValid(userId)) return false;

    const user = await Workspace.db
      .collection("users")
      .findOne(
        { _id: new Types.ObjectId(userId) },
        { projection: { role: 1 } },
      );

    return user?.role === "owner" || user?.role === "admin";
  }

  static async canJoinChannel(
    userId: string,
    channelId: string,
  ): Promise<boolean> {
    const channel = await Channel.findById(channelId)
      .select("type members workspaceId")
      .lean();

    if (!channel) return false;

    const isAlreadyMember = channel.members.some(
      (m: any) => m.toString() === userId,
    );
    if (isAlreadyMember) return true;

    if (channel.type === "public") return true;

    const isPrivilegedWorkspaceMember = await this.isWorkspaceOwnerOrAdmin(
      userId,
      channel.workspaceId.toString(),
    );
    if (isPrivilegedWorkspaceMember) return true;

    // For private channels, allow only when approved invite/request exists
    const approvedRequest = await ChannelJoinRequest.findOne({
      channelId,
      senderId: userId,
      status: "accepted",
      type: "request",
    }).lean();

    return !!approvedRequest;
  }

  static async canModifyChannel(
    userId: string,
    channelId: string,
  ): Promise<boolean> {
    const channel = await Channel.findById(channelId)
      .select("createdBy workspaceId")
      .lean();
    if (!channel) return false;

    if (channel.createdBy.toString() === userId) return true;

    const canManageByWorkspaceRole = await this.isWorkspaceOwnerOrAdmin(
      userId,
      channel.workspaceId.toString(),
    );
    if (canManageByWorkspaceRole) return true;

    const member = await ChannelMember.findOne({ channelId, userId })
      .select("role")
      .lean();
    return Boolean(
      member && (member.role === "owner" || member.role === "admin"),
    );
  }

  static async canApproveRequest(
    userId: string,
    channelId: string,
  ): Promise<boolean> {
    const channel = await Channel.findById(channelId)
      .select("workspaceId")
      .lean();
    if (!channel) return false;

    return this.isWorkspaceOwnerOrAdmin(userId, channel.workspaceId.toString());
  }

  static async canSendMessage(
    userId: string,
    channelId: string,
  ): Promise<boolean> {
    const member = await ChannelMember.findOne({ channelId, userId })
      .select("_id")
      .lean();
    if (member) return true;

    const channel = await Channel.findById(channelId).select("members").lean();
    if (!channel) return false;

    return channel.members.some((m: any) => m.toString() === userId);
  }
}
