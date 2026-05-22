import { BaseDAO } from "./BaseDAO";
import Message, { IMessage } from "../models/Message.model";
import MessageReaction from "../models/MessageReaction.model";
import { Types } from "mongoose";

export interface MessageListOptions {
  limit?: number;
  before?: Date; // cursor: fetch older than this timestamp
  after?: Date; // cursor: fetch newer than this timestamp
}

export interface MessageWithDetails extends IMessage {
  [key: string]: any;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
}

export class MessageDAO extends BaseDAO<IMessage> {
  constructor() {
    super(Message);
  }

  private async attachReactions(
    messages: any[],
  ): Promise<MessageWithDetails[]> {
    if (!messages.length) return [];

    const messageIds = messages.map((m) => m._id);
    const reactionRows = await MessageReaction.aggregate([
      { $match: { messageId: { $in: messageIds } } },
      {
        $group: {
          _id: { messageId: "$messageId", emoji: "$emoji" },
          count: { $sum: 1 },
          users: { $addToSet: "$userId" },
        },
      },
    ]);

    const reactionMap = new Map<
      string,
      Array<{ emoji: string; count: number; users: string[] }>
    >();
    for (const row of reactionRows) {
      const key = row._id.messageId.toString();
      const item = {
        emoji: row._id.emoji,
        count: row.count,
        users: (row.users || []).map((u: any) => u.toString()),
      };
      const current = reactionMap.get(key) || [];
      current.push(item);
      reactionMap.set(key, current);
    }

    return messages.map((m) => ({
      ...m,
      reactions: reactionMap.get(m._id.toString()) || [],
    }));
  }

  async findByChannel(channelId: string, options: MessageListOptions = {}) {
    const { limit = 50, before, after } = options;
    const filter: any = { channelId: new Types.ObjectId(channelId) };

    if (before || after) {
      filter.createdAt = {};
      if (before) filter.createdAt.$lt = before;
      if (after) filter.createdAt.$gt = after;
    }

    const rows = await this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const data = await this.attachReactions(rows);

    return {
      data,
      meta: {
        limit,
        count: data.length,
        hasMore: data.length === limit,
        nextBefore: data.length ? data[data.length - 1].createdAt : null,
        nextAfter: data.length ? data[0].createdAt : null,
      },
    };
  }

  async findByIdWithDetails(messageId: string) {
    const message = await this.model.findById(messageId).lean();

    if (!message) return null;

    const [withReactions] = await this.attachReactions([message]);
    return withReactions;
  }

  async create(messageData: Partial<IMessage>) {
    const payload = {
      ...messageData,
      threadCount: (messageData as any).threadCount ?? 0,
    } as any;
    return this.model.create(payload);
  }

  async update(messageId: string, updateData: Partial<IMessage>) {
    return this.model
      .findByIdAndUpdate(
        messageId,
        {
          $set: {
            ...updateData,
            isEdited: true,
            editedAt: new Date(),
          },
        },
        { new: true },
      )
      .lean();
  }

  async delete(messageId: string) {
    return this.model
      .findByIdAndUpdate(
        messageId,
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            content: "This message was deleted",
            attachments: [],
          },
        },
        { new: true },
      )
      .lean();
  }

  async incrementThreadCount(messageId: string) {
    return this.model
      .findByIdAndUpdate(messageId, { $inc: { threadCount: 1 } }, { new: true })
      .lean();
  }
}
