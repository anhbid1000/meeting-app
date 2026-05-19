import { BaseDAO } from './BaseDAO';
import ChannelJoinRequest, {
  IChannelJoinRequest
} from '../models/ChannelJoinRequest.model';
import { Types } from 'mongoose';

export interface RequestListOptions {
  status?: 'pending' | 'accepted' | 'rejected';
  page?: number;
  limit?: number;
}

export class ChannelJoinRequestDAO extends BaseDAO<IChannelJoinRequest> {
  constructor() {
    super(ChannelJoinRequest);
  }

  async findByChannel(channelId: string, options: RequestListOptions = {}) {
    const { status, page = 1, limit = 20 } = options;
    const filter: any = { channelId: new Types.ObjectId(channelId) };
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'name email')
        .lean(),
      this.model.countDocuments(filter)
    ]);

    return {
      items,
      total,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findPendingForUser(userId: string) {
    return this.model
      .find({
        recipientId: new Types.ObjectId(userId),
        status: 'pending'
      })
      .populate('senderId', 'name email')
      .populate('channelId', 'name slug')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findByChannelAndUser(channelId: string, userId: string) {
    return this.model.findOne({
      channelId: new Types.ObjectId(channelId),
      senderId: new Types.ObjectId(userId)
    });
  }

  async updateStatus(
    requestId: string,
    status: 'accepted' | 'rejected' | 'revoked'
  ) {
    return this.updateById(requestId, { $set: { status } });
  }
}
