import { Types } from "mongoose";
import { ChannelDAO, ChannelListOptions } from "../dao/ChannelDAO";
import ChannelMember from "../models/ChannelMember.model";
import Workspace from "../models/Workspace.model";
import ChannelJoinRequest from "../models/ChannelJoinRequest.model";
import Message from "../models/Message.model";
import { PermissionService } from "./Permission.service";
import { slugify } from "../utils/slugify";

const channelDAO = new ChannelDAO();

export class ChannelService {
  static async getChannelDirectory(
    workspaceId: string,
    options: ChannelListOptions,
    userId?: string,
  ) {
    const { items, total, page, limit } = await channelDAO.findByWorkspace(
      workspaceId,
      options,
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
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$channelId",
            lastMessageText: { $first: "$content" },
            lastMessageAt: { $first: "$createdAt" },
            lastMessageSenderId: { $first: "$userId" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "lastMessageSenderId",
            foreignField: "_id",
            as: "sender",
          },
        },
        {
          $addFields: {
            lastMessageSenderName: {
              $ifNull: [
                { $arrayElemAt: ["$sender.name", 0] },
                {
                  $ifNull: [{ $arrayElemAt: ["$sender.email", 0] }, "Teammate"],
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
        lastMessages.map((m: any) => [String(m._id), m]),
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
        userId,
      })
        .select("channelId lastReadAt")
        .lean();

      const memberByChannelId = new Map(
        memberships.map((row: any) => [String(row.channelId), row]),
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
            filter.createdAt = { $gt: membership.lastReadAt };
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
        }),
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
  }

  static async createChannel(params: {
    workspaceId: string;
    userId: string;
    name: string;
    description?: string;
    type?: "public" | "private";
    category?: string;
  }) {
    const {
      workspaceId,
      userId,
      name,
      description,
      type = "public",
      category,
    } = params;

    // Basic validation
    if (!name?.trim()) {
      throw Object.assign(new Error("Channel name is required"), {
        status: 400,
      });
    }

    // Workspace must exist
    const workspace = await Workspace.findById(workspaceId)
      .select("ownerId channelCount plan")
      .lean();
    if (!workspace) {
      throw Object.assign(new Error("Workspace not found"), { status: 404 });
    }

    // (Optional) enforce plan limits (simple version)
    const maxChannels = workspace.plan === "pro" ? 20 : 5;
    if ((workspace.channelCount ?? 0) >= maxChannels) {
      throw Object.assign(new Error("Channel limit reached for your plan"), {
        status: 403,
      });
    }

    // Slug uniqueness in workspace
    let slug = slugify(name);
    let existing = await channelDAO.findBySlug(workspaceId, slug);
    let originalSlug = slug;
    let counter = 1;
    while (existing) {
      slug = `${originalSlug}-${counter++}`;
      existing = await channelDAO.findBySlug(workspaceId, slug);
    }

    const channel = await channelDAO.create({
      workspaceId: new Types.ObjectId(workspaceId) as any,
      name: name.trim(),
      description: description?.trim() || "",
      slug,
      type,
      category: category?.trim() || "General",
      createdBy: new Types.ObjectId(userId) as any,
      members: [new Types.ObjectId(userId) as any],
      memberCount: 1,
      isArchived: false,
    } as any);

    // Create ChannelMember record as owner
    await ChannelMember.create({
      channelId: channel._id,
      workspaceId: new Types.ObjectId(workspaceId),
      userId: new Types.ObjectId(userId),
      role: "owner",
      joinedAt: new Date(),
      lastReadAt: new Date(),
      isMuted: false,
      isFavorite: false,
    });

    // Update workspace channelCount
    await Workspace.findByIdAndUpdate(workspaceId, {
      $inc: { channelCount: 1 },
    }).lean();

    return channel;
  }

  static async updateChannel(params: {
    channelId: string;
    userId: string;
    name?: string;
    description?: string;
    type?: "public" | "private";
    category?: string;
    isArchived?: boolean;
  }) {
    const { channelId, userId, name, description, type, category, isArchived } =
      params;

    // Check user is owner/admin
    const canModify = await PermissionService.canModifyChannel(
      userId,
      channelId,
    );
    if (!canModify) {
      throw Object.assign(
        new Error("Forbidden: only owner/admin can modify channel"),
        { status: 403 },
      );
    }

    const update: any = {};
    if (name !== undefined) update.name = name.trim();
    if (description !== undefined) update.description = description.trim();
    if (type !== undefined) update.type = type;
    if (category !== undefined) update.category = category.trim();
    if (isArchived !== undefined) update.isArchived = isArchived;

    const updated = await channelDAO.updateById(channelId, {
      $set: update,
    } as any);
    if (!updated) {
      throw Object.assign(new Error("Channel not found"), { status: 404 });
    }
    return updated;
  }

  static async deleteChannel(params: { channelId: string; userId: string }) {
    const { channelId, userId } = params;

    // Check user is owner/admin (per your confirm #4)
    const canModify = await PermissionService.canModifyChannel(
      userId,
      channelId,
    );
    if (!canModify) {
      throw Object.assign(
        new Error("Forbidden: only owner/admin can delete channel"),
        { status: 403 },
      );
    }

    const channel = await channelDAO.findById(channelId);
    if (!channel) {
      throw Object.assign(new Error("Channel not found"), { status: 404 });
    }

    // Hard delete + cascade cleanup (per your confirm #3)
    await Promise.all([
      ChannelMember.deleteMany({ channelId }),
      Message.deleteMany({ channelId }),
      ChannelJoinRequest.deleteMany({ channelId }),
    ]);

    await channelDAO.delete(channelId);
    return true;
  }

  static async archiveChannel(params: { channelId: string; userId: string }) {
    const { channelId, userId } = params;

    // Check user is owner/admin (per your confirm #4)
    const canModify = await PermissionService.canModifyChannel(
      userId,
      channelId,
    );
    if (!canModify) {
      throw Object.assign(
        new Error("Forbidden: only owner/admin can archive channel"),
        { status: 403 },
      );
    }

    const archived = await channelDAO.archive(channelId);
    if (!archived) {
      throw Object.assign(new Error("Channel not found"), { status: 404 });
    }
    return archived;
  }
}
