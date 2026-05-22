import { Types } from "mongoose";
import { MessageDAO } from "../dao/MessageDAO";
import { PermissionService } from "./Permission.service";
import { messageReactionDAO } from "../dao/MessageReactionDAO";
import Channel from "../models/Channel.model";
import Message from "../models/Message.model";
import ChannelMember from "../models/ChannelMember.model";
import { realtimeBus } from "../utils/realtime";
import { NotificationService } from "./Notification.service";

const messageDAO = new MessageDAO();

export class MessageService {
  static async sendMessage(params: {
    channelId: string;
    userId: string;
    content: string;
    attachments?: any[];
    mentions?: string[];
    type?: "text" | "file" | "system" | "meeting";
  }) {
    const {
      channelId,
      userId,
      content,
      attachments = [],
      mentions = [],
      type = "text",
    } = params;

    const canSend = await PermissionService.canSendMessage(userId, channelId);
    if (!canSend) {
      throw Object.assign(
        new Error("Forbidden: you must be a member to send messages"),
        { status: 403 },
      );
    }

    const normalizedContent = (content || "").trim();
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    if (!normalizedContent && !hasAttachments) {
      throw Object.assign(new Error("Message content cannot be empty"), {
        status: 400,
      });
    }

    const channel = await Channel.findById(channelId)
      .select("workspaceId")
      .lean();
    if (!channel) {
      throw Object.assign(new Error("Channel not found"), { status: 404 });
    }

    const uniqueMentions = [...new Set((mentions || []).filter(Boolean))];

    const message = await messageDAO.create({
      workspaceId: channel.workspaceId,
      channelId: new Types.ObjectId(channelId),
      userId: new Types.ObjectId(userId),
      content: normalizedContent,
      attachments,
      mentions: uniqueMentions.map((m) => new Types.ObjectId(m)),
      type,
      threadCount: 0,
      isEdited: false,
      isDeleted: false,
      isPinned: false,
    } as any);

    await Channel.findByIdAndUpdate(channelId, {
      $set: { lastMessageAt: new Date() },
    }).lean();

    // Mention notification (best effort): only notify users who are members of this channel
    if (uniqueMentions.length) {
      const members = await ChannelMember.find({
        channelId,
        userId: { $in: uniqueMentions.map((m) => new Types.ObjectId(m)) },
      })
        .select("userId")
        .lean();

      const allowedMentionIds = new Set(
        members.map((m: any) => m.userId.toString()),
      );
      const notifications = uniqueMentions
        .filter((id) => id !== userId && allowedMentionIds.has(id))
        .map((mentionedUserId) => ({
          userId: mentionedUserId,
          workspaceId: String(channel.workspaceId),
          type: "mention" as const,
          relatedUserId: userId,
          relatedChannelId: channelId,
          relatedMessageId: String(message._id),
          title: "You were mentioned in a message",
          description: normalizedContent.slice(0, 180),
        }));

      if (notifications.length) {
        await NotificationService.createManyNotifications(notifications);
      }
    }

    const detailed = await messageDAO.findByIdWithDetails(
      message._id.toString(),
    );
    realtimeBus.emitEvent("message:new", detailed || message);
    return detailed || message;
  }

  static async getMessages(params: {
    channelId: string;
    userId: string;
    limit?: number;
    before?: Date;
    after?: Date;
  }) {
    const { channelId, userId, limit, before, after } = params;

    const canRead = await PermissionService.canSendMessage(userId, channelId);
    if (!canRead) {
      throw Object.assign(
        new Error("Forbidden: you must be a member to view messages"),
        { status: 403 },
      );
    }

    return messageDAO.findByChannel(channelId, { limit, before, after });
  }

  static async getPinnedMessages(params: {
    channelId: string;
    userId: string;
    limit?: number;
    before?: Date;
    after?: Date;
  }) {
    const { channelId, userId, limit, before, after } = params;

    const canRead = await PermissionService.canSendMessage(userId, channelId);
    if (!canRead) {
      throw Object.assign(
        new Error("Forbidden: you must be a member to view messages"),
        { status: 403 },
      );
    }

    return messageDAO.findPinnedByChannel(channelId, { limit, before, after });
  }

  static async editMessage(params: {
    messageId: string;
    userId: string;
    content: string;
  }) {
    const { messageId, userId, content } = params;

    const message = await Message.findById(messageId);
    if (!message) {
      throw Object.assign(new Error("Message not found"), { status: 404 });
    }

    if (message.userId.toString() !== userId) {
      throw Object.assign(
        new Error("Forbidden: you can only edit your own messages"),
        { status: 403 },
      );
    }

    const normalizedContent = (content || "").trim();
    if (!normalizedContent) {
      throw Object.assign(new Error("Message content cannot be empty"), {
        status: 400,
      });
    }

    const updated = await messageDAO.update(messageId, {
      content: normalizedContent,
    } as any);
    realtimeBus.emitEvent("message:update", updated);
    return updated;
  }

  static async deleteMessage(params: { messageId: string; userId: string }) {
    const { messageId, userId } = params;

    const message = await Message.findById(messageId);
    if (!message) {
      throw Object.assign(new Error("Message not found"), { status: 404 });
    }

    const channel = await Channel.findById(message.channelId)
      .select("workspaceId")
      .lean();
    if (!channel) {
      throw Object.assign(new Error("Channel not found"), { status: 404 });
    }

    const isSender = message.userId.toString() === userId;
    const isWorkspaceAdmin = await PermissionService.isWorkspaceOwnerOrAdmin(
      userId,
      channel.workspaceId.toString(),
    );

    if (!isSender && !isWorkspaceAdmin) {
      throw Object.assign(
        new Error("Forbidden: insufficient permissions to delete message"),
        {
          status: 403,
        },
      );
    }

    const deleted = await messageDAO.delete(messageId);
    realtimeBus.emitEvent("message:delete", {
      messageId,
      channelId: message.channelId,
    });
    return deleted;
  }

  static async pinMessage(params: {
    messageId: string;
    userId: string;
    channelId?: string;
  }) {
    const { messageId, userId } = params;

    const message = await Message.findById(messageId);
    if (!message) {
      throw Object.assign(new Error("Message not found"), { status: 404 });
    }

    const channel = await Channel.findById(message.channelId)
      .select("workspaceId")
      .lean();
    if (!channel) {
      throw Object.assign(new Error("Channel not found"), { status: 404 });
    }

    const canPin = await PermissionService.canSendMessage(
      userId,
      message.channelId.toString(),
    );
    if (!canPin) {
      throw Object.assign(
        new Error("Forbidden: you must be a channel member to pin messages"),
        {
          status: 403,
        },
      );
    }

    const updated = await messageDAO.updateById(messageId, {
      $set: { isPinned: true },
    });

    const rawName = Types.ObjectId.isValid(userId)
      ? await Message.db
          .collection("users")
          .findOne(
            { _id: new Types.ObjectId(userId) },
            { projection: { name: 1, email: 1 } },
          )
      : null;

    const displayName =
      rawName?.name || rawName?.email || `User ${userId.slice(0, 6)}`;

    const notice = await messageDAO.create({
      workspaceId: channel.workspaceId,
      channelId: message.channelId,
      userId: new Types.ObjectId(userId),
      content: `${displayName} pinned a message`,
      type: "system",
      attachments: [],
      mentions: [],
      threadCount: 0,
      isEdited: false,
      isDeleted: false,
      isPinned: false,
    } as any);

    realtimeBus.emitEvent("message:pin", updated);

    const detailedNotice = await messageDAO.findByIdWithDetails(
      notice._id.toString(),
    );
    realtimeBus.emitEvent("message:new", detailedNotice || notice);

    return updated;
  }

  static async unpinMessage(params: { messageId: string; userId: string }) {
    const { messageId, userId } = params;

    const message = await Message.findById(messageId);
    if (!message) {
      throw Object.assign(new Error("Message not found"), { status: 404 });
    }

    const channel = await Channel.findById(message.channelId)
      .select("workspaceId")
      .lean();
    if (!channel) {
      throw Object.assign(new Error("Channel not found"), { status: 404 });
    }

    const canUnpin = await PermissionService.canSendMessage(
      userId,
      message.channelId.toString(),
    );
    if (!canUnpin) {
      throw Object.assign(
        new Error("Forbidden: you must be a channel member to unpin messages"),
        {
          status: 403,
        },
      );
    }

    const updated = await messageDAO.updateById(messageId, {
      $set: { isPinned: false },
    });

    const rawName = Types.ObjectId.isValid(userId)
      ? await Message.db
          .collection("users")
          .findOne(
            { _id: new Types.ObjectId(userId) },
            { projection: { name: 1, email: 1 } },
          )
      : null;

    const displayName =
      rawName?.name || rawName?.email || `User ${userId.slice(0, 6)}`;

    const notice = await messageDAO.create({
      workspaceId: channel.workspaceId,
      channelId: message.channelId,
      userId: new Types.ObjectId(userId),
      content: `${displayName} unpinned a message`,
      type: "system",
      attachments: [],
      mentions: [],
      threadCount: 0,
      isEdited: false,
      isDeleted: false,
      isPinned: false,
    } as any);

    realtimeBus.emitEvent("message:unpin", updated);

    const detailedNotice = await messageDAO.findByIdWithDetails(
      notice._id.toString(),
    );
    realtimeBus.emitEvent("message:new", detailedNotice || notice);

    return updated;
  }

  static async addReaction(params: {
    messageId: string;
    userId: string;
    emoji: string;
  }) {
    const { messageId, userId } = params;
    const emoji = (params.emoji || "").trim();

    if (!emoji) {
      throw Object.assign(new Error("Emoji is required"), { status: 422 });
    }

    const message = await Message.findById(messageId)
      .select("channelId workspaceId")
      .lean();
    if (!message) {
      throw Object.assign(new Error("Message not found"), { status: 404 });
    }

    const canReact = await PermissionService.canSendMessage(
      userId,
      message.channelId.toString(),
    );
    if (!canReact) {
      throw Object.assign(
        new Error("Forbidden: you must be a channel member to react"),
        { status: 403 },
      );
    }

    await messageReactionDAO.addReaction({
      messageId,
      channelId: message.channelId.toString(),
      workspaceId: message.workspaceId.toString(),
      userId,
      emoji,
    });

    const detailedMessage = await messageDAO.findByIdWithDetails(messageId);
    const reactions = detailedMessage?.reactions || [];

    const payload = {
      messageId,
      channelId: message.channelId.toString(),
      userId,
      emoji,
      reactions,
    };

    realtimeBus.emitEvent("reaction:add", payload);
    if (detailedMessage) {
      realtimeBus.emitEvent("message:update", detailedMessage);
    }
    return payload;
  }

  static async removeReaction(params: {
    messageId: string;
    userId: string;
    emoji: string;
  }) {
    const { messageId, userId } = params;
    const emoji = (params.emoji || "").trim();

    if (!emoji) {
      throw Object.assign(new Error("Emoji is required"), { status: 422 });
    }

    const message = await Message.findById(messageId)
      .select("channelId workspaceId")
      .lean();
    if (!message) {
      throw Object.assign(new Error("Message not found"), { status: 404 });
    }

    const canReact = await PermissionService.canSendMessage(
      userId,
      message.channelId.toString(),
    );
    if (!canReact) {
      throw Object.assign(
        new Error("Forbidden: you must be a channel member to react"),
        { status: 403 },
      );
    }

    await messageReactionDAO.removeReaction({
      messageId,
      userId,
      emoji,
    });

    const detailedMessage = await messageDAO.findByIdWithDetails(messageId);
    const reactions = detailedMessage?.reactions || [];

    const payload = {
      messageId,
      channelId: message.channelId.toString(),
      userId,
      emoji,
      reactions,
    };

    realtimeBus.emitEvent("reaction:remove", payload);
    if (detailedMessage) {
      realtimeBus.emitEvent("message:update", detailedMessage);
    }
    return payload;
  }
}
