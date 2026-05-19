import Workspace from '../models/Workspace.model';
import Channel from '../models/Channel.model';
import ChannelMember from '../models/ChannelMember.model';
import ChannelJoinRequest from '../models/ChannelJoinRequest.model';

export class PermissionService {
  static async isWorkspaceOwnerOrAdmin(userId: string, workspaceId: string): Promise<boolean> {
    const workspace = await Workspace.findById(workspaceId).select('ownerId').lean();
    if (!workspace) return false;

    // Current schema only supports owner vs member; treat owner as admin-equivalent.
    return workspace.ownerId.toString() === userId;
  }

  static async canJoinChannel(userId: string, channelId: string): Promise<boolean> {
    const channel = await Channel.findById(channelId)
      .select('type members workspaceId')
      .lean();

    if (!channel) return false;

    const isAlreadyMember = channel.members.some((m: any) => m.toString() === userId);
    if (isAlreadyMember) return true;

    if (channel.type === 'public') return true;

    // For private channels, allow only when approved invite/request exists
    const approvedRequest = await ChannelJoinRequest.findOne({
      channelId,
      senderId: userId,
      status: 'accepted',
      type: 'request'
    }).lean();

    return !!approvedRequest;
  }

  static async canModifyChannel(userId: string, channelId: string): Promise<boolean> {
    const member = await ChannelMember.findOne({ channelId, userId }).select('role').lean();
    if (member) return member.role === 'owner' || member.role === 'admin';

    const channel = await Channel.findById(channelId).select('createdBy').lean();
    if (!channel) return false;
    return channel.createdBy.toString() === userId;
  }

  static async canApproveRequest(userId: string, channelId: string): Promise<boolean> {
    const channel = await Channel.findById(channelId).select('workspaceId').lean();
    if (!channel) return false;

    return this.isWorkspaceOwnerOrAdmin(userId, channel.workspaceId.toString());
  }

  static async canSendMessage(userId: string, channelId: string): Promise<boolean> {
    const member = await ChannelMember.findOne({ channelId, userId }).select('_id').lean();
    if (member) return true;

    const channel = await Channel.findById(channelId).select('members').lean();
    if (!channel) return false;

    return channel.members.some((m: any) => m.toString() === userId);
  }
}
