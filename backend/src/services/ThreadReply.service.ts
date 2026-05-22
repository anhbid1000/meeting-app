import { Types } from "mongoose";
import Message from "../models/Message.model";
import ThreadReply from "../models/ThreadReply.model";
import { ThreadReplyDAO } from "../dao/ThreadReplyDAO";
import { PermissionService } from "./Permission.service";
import { realtimeBus } from "../utils/realtime";

const threadReplyDAO = new ThreadReplyDAO();

export class ThreadReplyService {
  static async getThreadReplies(params: {
    messageId: string;
    userId: string;
    page?: number;
    limit?: number;
  }) {
    const { messageId, userId, page = 1, limit = 100 } = params;

    const parentMessage = await Message.findById(messageId)
      .select("channelId")
      .lean();
    if (!parentMessage) {
      throw Object.assign(new Error("Parent message not found"), {
        status: 404,
      });
    }

    const canRead = await PermissionService.canSendMessage(
      userId,
      parentMessage.channelId.toString(),
    );
    if (!canRead) {
      throw Object.assign(
        new Error(
          "Forbidden: you must be a channel member to view thread replies",
        ),
        { status: 403 },
      );
    }

    return threadReplyDAO.findByParentMessage(messageId, page, limit);
  }

  static async createThreadReply(params: {
    messageId: string;
    userId: string;
    content: string;
    attachments?: Array<{
      url: string;
      name: string;
      mimeType: string;
      size: number;
    }>;
  }) {
    const { messageId, userId, content, attachments = [] } = params;

    const parentMessage = await Message.findById(messageId)
      .select("workspaceId channelId")
      .lean();
    if (!parentMessage) {
      throw Object.assign(new Error("Parent message not found"), {
        status: 404,
      });
    }

    const canReply = await PermissionService.canSendMessage(
      userId,
      parentMessage.channelId.toString(),
    );
    if (!canReply) {
      throw Object.assign(
        new Error("Forbidden: you must be a channel member to reply in thread"),
        { status: 403 },
      );
    }

    const normalized = (content || "").trim();
    if (!normalized) {
      throw Object.assign(new Error("Reply content cannot be empty"), {
        status: 400,
      });
    }

    const created = await ThreadReply.create({
      parentMessageId: new Types.ObjectId(messageId),
      workspaceId: parentMessage.workspaceId,
      channelId: parentMessage.channelId,
      userId: new Types.ObjectId(userId),
      content: normalized,
      attachments,
      isEdited: false,
      isDeleted: false,
    });

    const updatedParent = await Message.findByIdAndUpdate(
      messageId,
      { $inc: { threadCount: 1 } },
      { new: true },
    )
      .select("threadCount")
      .lean();

    const detailed = await threadReplyDAO.findByIdWithAuthor(
      created._id.toString(),
    );

    realtimeBus.emitEvent("thread:reply:new", {
      reply: detailed || created.toObject(),
      parentMessageId: messageId,
      channelId: parentMessage.channelId.toString(),
      threadCount: updatedParent?.threadCount || 0,
    });

    return detailed || created.toObject();
  }

  static async editThreadReply(params: {
    replyId: string;
    userId: string;
    content: string;
  }) {
    const { replyId, userId, content } = params;

    const reply = await ThreadReply.findById(replyId)
      .select("userId workspaceId channelId")
      .lean();
    if (!reply) {
      throw Object.assign(new Error("Thread reply not found"), { status: 404 });
    }

    const normalized = (content || "").trim();
    if (!normalized) {
      throw Object.assign(new Error("Reply content cannot be empty"), {
        status: 400,
      });
    }

    const isOwner = String(reply.userId) === String(userId);
    const isWorkspaceAdmin = await PermissionService.isWorkspaceOwnerOrAdmin(
      userId,
      String(reply.workspaceId),
    );

    if (!isOwner && !isWorkspaceAdmin) {
      throw Object.assign(
        new Error("Forbidden: insufficient permissions to edit this reply"),
        { status: 403 },
      );
    }

    const updated = await ThreadReply.findByIdAndUpdate(
      replyId,
      {
        $set: {
          content: normalized,
          isEdited: true,
          editedAt: new Date(),
        },
      },
      { new: true },
    ).lean();

    const detailed = await threadReplyDAO.findByIdWithAuthor(replyId);

    realtimeBus.emitEvent("thread:reply:update", {
      reply: detailed || updated,
      parentMessageId: updated?.parentMessageId?.toString?.(),
      channelId: String(reply.channelId),
    });

    return detailed || updated;
  }

  static async deleteThreadReply(params: { replyId: string; userId: string }) {
    const { replyId, userId } = params;

    const reply = await ThreadReply.findById(replyId)
      .select("userId workspaceId channelId parentMessageId isDeleted")
      .lean();
    if (!reply) {
      throw Object.assign(new Error("Thread reply not found"), { status: 404 });
    }

    const isOwner = String(reply.userId) === String(userId);
    const isWorkspaceAdmin = await PermissionService.isWorkspaceOwnerOrAdmin(
      userId,
      String(reply.workspaceId),
    );

    if (!isOwner && !isWorkspaceAdmin) {
      throw Object.assign(
        new Error("Forbidden: insufficient permissions to delete this reply"),
        { status: 403 },
      );
    }

    if (!reply.isDeleted) {
      await Message.findByIdAndUpdate(reply.parentMessageId, {
        $inc: { threadCount: -1 },
      });
    }

    await ThreadReply.findByIdAndUpdate(replyId, {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
        content: "This reply was deleted",
        attachments: [],
      },
    }).lean();

    const parentMessage = await Message.findById(reply.parentMessageId)
      .select("threadCount")
      .lean();

    realtimeBus.emitEvent("thread:reply:delete", {
      replyId,
      parentMessageId: String(reply.parentMessageId),
      channelId: String(reply.channelId),
      threadCount: parentMessage?.threadCount || 0,
    });

    return { success: true };
  }
}
