import { Types } from 'mongoose';
import ChannelMember from '../models/ChannelMember.model';
import Channel from '../models/Channel.model';
import { realtimeBus } from '../utils/realtime';

export class ChannelMemberService {
  static async addMember(channelId: string, userId: string, workspaceId: string, role: 'owner' | 'admin' | 'member' = 'member') {
    const exists = await ChannelMember.findOne({ channelId, userId }).lean();
    if (exists) return exists;

    const created = await ChannelMember.create({
      channelId: new Types.ObjectId(channelId),
      userId: new Types.ObjectId(userId),
      workspaceId: new Types.ObjectId(workspaceId),
      role,
      joinedAt: new Date(),
      lastReadAt: new Date(),
      isMuted: false,
      isFavorite: false
    });

    // Keep legacy members[] and memberCount in sync for now
    await Channel.findByIdAndUpdate(channelId, {
      $addToSet: { members: new Types.ObjectId(userId) },
      $inc: { memberCount: 1 }
    }).lean();

    realtimeBus.emitEvent('channel:member:added', {
      channelId,
      userId,
      role
    });

    return created.toObject();
  }

  static async removeMember(channelId: string, userId: string) {
    await ChannelMember.deleteOne({ channelId, userId });
    await Channel.findByIdAndUpdate(channelId, {
      $pull: { members: new Types.ObjectId(userId) },
      $inc: { memberCount: -1 }
    }).lean();

    realtimeBus.emitEvent('channel:member:removed', {
      channelId,
      userId
    });

    return true;
  }

  static async updateMemberRole(channelId: string, userId: string, role: 'owner' | 'admin' | 'member') {
    return ChannelMember.findOneAndUpdate(
      { channelId, userId },
      { $set: { role } },
      { new: true }
    ).lean();
  }

  static async muteChannel(channelId: string, userId: string, isMuted: boolean) {
    return ChannelMember.findOneAndUpdate(
      { channelId, userId },
      { $set: { isMuted } },
      { new: true }
    ).lean();
  }

  static async favoriteChannel(channelId: string, userId: string, isFavorite: boolean) {
    return ChannelMember.findOneAndUpdate(
      { channelId, userId },
      { $set: { isFavorite } },
      { new: true }
    ).lean();
  }

  static async getChannelMembers(channelId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ChannelMember.find({ channelId })
        .sort({ role: 1, joinedAt: 1 })
        .skip(skip)
        .limit(limit)
        // Populate user basic info (no User.model in this repo yet, so rely on ref name)
        .populate('userId', 'name email')
        .lean(),
      ChannelMember.countDocuments({ channelId })
    ]);

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
