import { Types } from 'mongoose';
import Channel, { IChannel } from '../models/Channel.model';
import { BaseDAO } from './BaseDAO';

export interface ChannelListOptions {
  type?: 'public' | 'private';
  category?: string;
  isArchived?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'activity' | 'alphabetical' | 'members' | 'name' | 'memberCount' | 'createdAt';
}

export class ChannelDAO extends BaseDAO<IChannel> {
  constructor() {
    super(Channel);
  }

  async findByWorkspaceId(workspaceId: string) {
    return this.model
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .lean();
  }

  async findByWorkspace(workspaceId: string, options: ChannelListOptions = {}) {
    const {
      type,
      category,
      isArchived,
      search,
      page = 1,
      limit = 20,
      sort = 'activity',
    } = options;

    const filter: any = {
      workspaceId: new Types.ObjectId(workspaceId),
    };

    if (typeof isArchived === 'boolean') {
      filter.isArchived = isArchived;
    }

    if (type) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const normalizedSort =
      sort === 'name'
        ? 'alphabetical'
        : sort === 'memberCount'
          ? 'members'
          : sort;

    const sortSpec: any =
      normalizedSort === 'alphabetical'
        ? { name: 1 }
        : normalizedSort === 'members'
          ? { memberCount: -1, updatedAt: -1 }
          : normalizedSort === 'createdAt'
            ? { createdAt: -1, updatedAt: -1 }
            : { lastMessageAt: -1, updatedAt: -1 };

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(sortSpec)
        .skip(skip)
        .limit(limit)
        .lean(),

      this.model.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findById(channelId: string) {
    return this.model.findById(channelId).lean();
  }

  async findBySlug(workspaceId: string, slug: string) {
    return this.model
      .findOne({
        workspaceId: new Types.ObjectId(workspaceId),
        slug,
      })
      .lean();
  }

  async update(channelId: string, updateData: Partial<IChannel>) {
    return this.model
      .findByIdAndUpdate(channelId, updateData, { new: true })
      .lean();
  }

  async delete(channelId: string) {
    return this.model.findByIdAndDelete(channelId).lean();
  }

  async archive(channelId: string) {
    return this.model
      .findByIdAndUpdate(
        channelId,
        { $set: { isArchived: true } },
        { new: true }
      )
      .lean();
  }
}

export default new ChannelDAO();