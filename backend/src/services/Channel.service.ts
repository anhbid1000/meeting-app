import { Types } from 'mongoose';
import channelDAO, { ChannelListOptions } from '../dao/ChannelDAO';
import Workspace from '../models/Workspace.model';
import ChannelMember from '../models/ChannelMember.model';
import { AppError } from '../utils/AppError';
import { slugify } from '../utils/slugify';
import ChannelJoinRequest from '../models/ChannelJoinRequest.model';
import Message from '../models/Message.model';
import { PermissionService } from './Permission.service';

interface CreateChannelData {
  workspaceId: string;
  name: string;
  description?: string;
  type: 'public' | 'private';
  createdBy: string;
  memberIds?: string[];
}

export const createChannel = async (data: CreateChannelData) => {
  const { workspaceId, name, description, type, createdBy, memberIds } = data;

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new AppError('Workspace không tồn tại', 404, 'WORKSPACE_NOT_FOUND');
  }

  const slug = slugify(name);
  const existingChannel = await channelDAO.findBySlug(workspaceId, slug);

  if (existingChannel) {
    throw new AppError(
      'Channel với slug này đã tồn tại trong workspace',
      400,
      'CHANNEL_ALREADY_EXISTS'
    );
  }

  let initialMembers: Types.ObjectId[] = [];

  if (type === 'public') {
    initialMembers = workspace.members.map(
      (member) => member.userId as unknown as Types.ObjectId
    );
  } else {
    const uniqueMemberIds = new Set([createdBy, ...(memberIds || [])]);
    initialMembers = Array.from(uniqueMemberIds).map(
      (id) => new Types.ObjectId(id)
    );
  }

  const channel = await channelDAO.create({
    workspaceId: new Types.ObjectId(workspaceId),
    name,
    description,
    slug,
    type,
    createdBy: new Types.ObjectId(createdBy),
    members: initialMembers,
  } as any);

  const channelMemberDocs = initialMembers.map((userId) => ({
    channelId: channel._id,
    workspaceId: new Types.ObjectId(workspaceId),
    userId,
    role: String(userId) === createdBy ? 'owner' : 'member',
    status: 'active',
    joinedAt: new Date(),
  }));

  await ChannelMember.insertMany(channelMemberDocs);

  return channel;
};

export const getChannelDirectory = async (
  workspaceId: string,
  options: ChannelListOptions,
  userId?: string
) => {
  const { items, total, page, limit } = await channelDAO.findByWorkspace(
    workspaceId,
    options
  );

  const channelIds = items.map((item: any) => item._id);

  let latestMessageByChannelId = new Map<
    string,
    {
      lastMessageText?: string;
      lastMessageSenderName?: string;
      lastMessageAt?: Date;
    }
  >();

  if (channelIds.length > 0) {
    const lastMessages = await Message.aggregate([
      {
        $match: {
          channelId: { $in: channelIds },
          isDeleted: { $ne: true },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: '$channelId',
          lastMessageText: { $first: '$content' },
          lastMessageAt: { $first: '$createdAt' },
          lastMessageSenderId: { $first: '$userId' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessageSenderId',
          foreignField: '_id',
          as: 'sender',
        },
      },
      {
        $addFields: {
          lastMessageSenderName: {
            $ifNull: [
              { $arrayElemAt: ['$sender.name', 0] },
              {
                $ifNull: [{ $arrayElemAt: ['$sender.email', 0] }, 'Teammate'],
              },
            ],
          },
        },
      },
      {
        $project: {
          sender: 0,
          lastMessageSenderId: 0,
        },
      },
    ]);

    latestMessageByChannelId = new Map(
      lastMessages.map((message: any) => [String(message._id), message])
    );
  }

  const enrichedItems = items.map((channel: any) => {
    const latest = latestMessageByChannelId.get(String(channel._id));

    return {
      ...channel,
      lastMessageText: latest?.lastMessageText,
      lastMessageSenderName: latest?.lastMessageSenderName,
      lastMessageAt: latest?.lastMessageAt || channel.lastMessageAt,
    };
  });

  const unreadCountByChannelId = new Map<string, number>();
  const mentionCountByChannelId = new Map<string, number>();

  if (userId && channelIds.length > 0) {
    const memberships = await ChannelMember.find({
      channelId: { $in: channelIds },
      userId: new Types.ObjectId(userId),
    })
      .select('channelId lastReadAt')
      .lean();

    const memberByChannelId = new Map(
      memberships.map((row: any) => [String(row.channelId), row])
    );

    await Promise.all(
      enrichedItems.map(async (channel: any) => {
        const channelId = String(channel._id);
        const membership = memberByChannelId.get(channelId);

        if (!membership) {
          unreadCountByChannelId.set(channelId, 0);
          mentionCountByChannelId.set(channelId, 0);
          return;
        }

        const filter: any = {
          channelId: channel._id,
          isDeleted: { $ne: true },
        };

        if (membership.lastReadAt) {
          filter.createdAt = {
            $gt: membership.lastReadAt,
          };
        }

        const mentionFilter: any = {
          ...filter,
          mentions: {
            $in: [new Types.ObjectId(userId), userId],
          },
        };

        const [unreadCount, mentionCount] = await Promise.all([
          Message.countDocuments(filter),
          Message.countDocuments(mentionFilter),
        ]);

        unreadCountByChannelId.set(channelId, unreadCount);
        mentionCountByChannelId.set(channelId, mentionCount);
      })
    );
  }

  const withUnread = enrichedItems.map((channel: any) => ({
    ...channel,
    unreadCount: unreadCountByChannelId.get(String(channel._id)) || 0,
    mentionCount: mentionCountByChannelId.get(String(channel._id)) || 0,
  }));

  return {
    data: withUnread,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateChannel = async (params: {
  channelId: string;
  userId: string;
  name?: string;
  description?: string;
  type?: 'public' | 'private';
  category?: string;
  isArchived?: boolean;
}) => {
  const { channelId, userId, name, description, type, category, isArchived } =
    params;

  const canModify = await PermissionService.canModifyChannel(userId, channelId);

  if (!canModify) {
    throw Object.assign(
      new Error('Forbidden: only owner/admin can modify channel'),
      {
        status: 403,
      }
    );
  }

  const update: any = {};

  if (name !== undefined) {
    update.name = name.trim();
    update.slug = slugify(name);
  }

  if (description !== undefined) {
    update.description = description.trim();
  }

  if (type !== undefined) {
    update.type = type;
  }

  if (category !== undefined) {
    update.category = category.trim();
  }

  if (isArchived !== undefined) {
    update.isArchived = isArchived;
  }

  const updated = await channelDAO.update(channelId, update);

  if (!updated) {
    throw Object.assign(new Error('Channel not found'), {
      status: 404,
    });
  }

  return updated;
};

export const deleteChannel = async (params: {
  channelId: string;
  userId: string;
}) => {
  const { channelId, userId } = params;

  const canModify = await PermissionService.canModifyChannel(userId, channelId);

  if (!canModify) {
    throw Object.assign(
      new Error('Forbidden: only owner/admin can delete channel'),
      {
        status: 403,
      }
    );
  }

  const channel = await channelDAO.findById(channelId);

  if (!channel) {
    throw Object.assign(new Error('Channel not found'), {
      status: 404,
    });
  }

  await Promise.all([
    ChannelMember.deleteMany({
      channelId: new Types.ObjectId(channelId),
    }),
    Message.deleteMany({
      channelId: new Types.ObjectId(channelId),
    }),
    ChannelJoinRequest.deleteMany({
      channelId: new Types.ObjectId(channelId),
    }),
  ]);

  await channelDAO.delete(channelId);

  return true;
};

export const archiveChannel = async (params: {
  channelId: string;
  userId: string;
}) => {
  const { channelId, userId } = params;

  const canModify = await PermissionService.canModifyChannel(userId, channelId);

  if (!canModify) {
    throw Object.assign(
      new Error('Forbidden: only owner/admin can archive channel'),
      {
        status: 403,
      }
    );
  }

  const archived = await channelDAO.archive(channelId);

  if (!archived) {
    throw Object.assign(new Error('Channel not found'), {
      status: 404,
    });
  }

  return archived;
};
