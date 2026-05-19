import { Types } from 'mongoose';
import { ChannelJoinRequestDAO } from '../dao/ChannelJoinRequestDAO';
import { ChannelMemberService } from './ChannelMember.service';
import { PermissionService } from './Permission.service';
import Channel from '../models/Channel.model';
import ChannelJoinRequest from '../models/ChannelJoinRequest.model';
import { realtimeBus } from '../utils/realtime';

const requestDAO = new ChannelJoinRequestDAO();

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
      .select('type workspaceId members isArchived')
      .lean();
    if (!channel) {
      throw Object.assign(new Error('Channel not found'), { status: 404 });
    }

    if (channel.isArchived) {
      throw Object.assign(new Error('Cannot request to join archived channel'), {
        status: 400
      });
    }

    // 2. Check user is not already member
    const isMember = channel.members.some((m: any) => m.toString() === userId);
    if (isMember) {
      throw Object.assign(new Error('You are already a member of this channel'), {
        status: 400
      });
    }

    // 3. For public channels, auto-add user (no request needed)
    if (channel.type === 'public') {
      return {
        message: 'Auto-joined public channel',
        autoJoined: true
      };
    }

    // 4. For private channels, check if request already pending
    const existing = await requestDAO.findByChannelAndUser(channelId, userId);
    if (existing && existing.status === 'pending') {
      throw Object.assign(
        new Error('You already have a pending request for this channel'),
        { status: 400 }
      );
    }

    // 5. Create request
    const request = await requestDAO.create({
      channelId: new Types.ObjectId(channelId),
      workspaceId: new Types.ObjectId(channel.workspaceId),
      senderId: new Types.ObjectId(userId),
      type: 'request',
      status: 'pending',
      message: message?.trim() || ''
    } as any);

    // 6. Emit realtime event
    realtimeBus.emitEvent('join_request:new', {
      requestId: request._id,
      channelId,
      userId,
      message
    });

    // 7. TODO: Send notification to channel owner/admins
    // (Will implement in Phase 5 when Notification system is wired)

    return {
      success: true,
      data: request,
      message: 'Request sent to channel admins'
    };
  }

  /**
   * Approve a pending request.
   * Admin/owner of workspace can approve.
   * Adds user to channel and updates request status.
   */
  static async approveRequest(params: {
    requestId: string;
    userId: string;
  }) {
    const { requestId, userId } = params;

    // 1. Get request
    const request = await requestDAO.findById(requestId);
    if (!request) {
      throw Object.assign(new Error('Request not found'), { status: 404 });
    }

    if (request.status !== 'pending') {
      throw Object.assign(
        new Error(`Cannot approve non-pending request (status: ${request.status})`),
        { status: 400 }
      );
    }

    // 2. Check approver is workspace owner/admin
    const canApprove = await PermissionService.canApproveRequest(
      userId,
      request.channelId.toString()
    );
    if (!canApprove) {
      throw Object.assign(
        new Error('Forbidden: only workspace owner/admin can approve requests'),
        { status: 403 }
      );
    }

    // 3. Add user to channel
    const channel = await Channel.findById(request.channelId)
      .select('workspaceId')
      .lean();
    if (!channel) {
      throw Object.assign(new Error('Channel not found'), { status: 404 });
    }

    await ChannelMemberService.addMember(
      request.channelId.toString(),
      request.senderId.toString(),
      channel.workspaceId.toString(),
      'member'
    );

    // 4. Update request status
    const updated = await requestDAO.updateStatus(requestId, 'accepted');

    // 5. Emit realtime event
    realtimeBus.emitEvent('join_request:approved', {
      requestId,
      channelId: request.channelId,
      userId: request.senderId
    });

    // 6. TODO: Send notification to user
    // (Will implement in Phase 5 when Notification system is wired)

    return {
      success: true,
      data: updated,
      message: 'Request approved. User added to channel.'
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
      throw Object.assign(new Error('Request not found'), { status: 404 });
    }

    if (request.status !== 'pending') {
      throw Object.assign(
        new Error(`Cannot reject non-pending request (status: ${request.status})`),
        { status: 400 }
      );
    }

    // 2. Check approver is workspace owner/admin
    const canApprove = await PermissionService.canApproveRequest(
      userId,
      request.channelId.toString()
    );
    if (!canApprove) {
      throw Object.assign(
        new Error('Forbidden: only workspace owner/admin can reject requests'),
        { status: 403 }
      );
    }

    // 3. Update request status
    const updated = await requestDAO.updateStatus(requestId, 'rejected');

    // 4. Emit realtime event
    realtimeBus.emitEvent('join_request:rejected', {
      requestId,
      channelId: request.channelId,
      userId: request.senderId,
      reason
    });

    // 5. TODO: Send notification to user
    // (Will implement in Phase 5 when Notification system is wired)

    return {
      success: true,
      data: updated,
      message: 'Request rejected.'
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
    const canApprove = await PermissionService.canApproveRequest(userId, channelId);
    if (!canApprove) {
      throw Object.assign(
        new Error('Forbidden: only workspace owner/admin can view requests'),
        { status: 403 }
      );
    }

    const result = await requestDAO.findByChannel(channelId, {
      status: 'pending',
      page,
      limit
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
      count: requests.length
    };
  }
}
