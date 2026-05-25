import { Types } from "mongoose";
import { BaseDAO } from "./BaseDAO";
import ThreadReply, { IThreadReply } from "../models/ThreadReply.model";

export class ThreadReplyDAO extends BaseDAO<IThreadReply> {
  constructor() {
    super(ThreadReply);
  }

  private async attachAuthors(replies: any[]) {
    if (!replies.length) return [];

    const uniqueUserIds = Array.from(
      new Set(
        replies
          .map((reply) => String(reply.userId))
          .filter((id) => Types.ObjectId.isValid(id)),
      ),
    ).map((id) => new Types.ObjectId(id));

    const users = uniqueUserIds.length
      ? await this.model.db
          .collection("users")
          .find(
            { _id: { $in: uniqueUserIds } },
            { projection: { name: 1, email: 1, avatar: 1 } },
          )
          .toArray()
      : [];

    const userMap = new Map(users.map((user: any) => [String(user._id), user]));

    return replies.map((reply) => {
      const userId = String(reply.userId);
      const user = userMap.get(userId);

      return {
        ...reply,
        userId,
        author: user
          ? {
              _id: userId,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
            }
          : undefined,
      };
    });
  }

  async findByParentMessage(messageId: string, page = 1, limit = 100) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 200);
    const skip = (safePage - 1) * safeLimit;

    const [rows, total] = await Promise.all([
      this.model
        .find({ parentMessageId: new Types.ObjectId(messageId) })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      this.model.countDocuments({
        parentMessageId: new Types.ObjectId(messageId),
      }),
    ]);

    const withAuthors = await this.attachAuthors(rows);

    return {
      data: withAuthors,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findByIdWithAuthor(replyId: string) {
    const row = await this.model.findById(replyId).lean();
    if (!row) return null;

    const withAuthors = await this.attachAuthors([row]);
    return withAuthors[0] || null;
  }
}
