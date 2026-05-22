import { Server, Socket } from "socket.io";
import { MessageService } from "../services/Message.service";
import { realtimeBus } from "../utils/realtime";
import Workspace from "../models/Workspace.model";

const resolveSenderName = (message: any) => {
  const author = message?.author;
  return (
    author?.name ||
    author?.email ||
    (typeof message?.userId === "string"
      ? `User ${message.userId.slice(0, 8)}`
      : "Teammate")
  );
};

const normalizeMentionIds = (mentions: any): string[] => {
  if (!Array.isArray(mentions)) return [];
  return mentions
    .map((item) => {
      if (!item) return "";
      if (typeof item === "string") return item;
      if (typeof item === "object") {
        return String(item._id || item.id || "");
      }
      return "";
    })
    .filter(Boolean);
};

export const registerMessageBusHandlers = (io: Server) => {
  realtimeBus.on("message:new", (message: any) => {
    const channelId =
      message?.channelId?._id?.toString?.() ||
      message?.channelId?.toString?.() ||
      message?.channelId;
    if (channelId) {
      io.to(`channel:${channelId}`).emit("message:new", message);

      const workspaceId =
        message?.workspaceId?._id?.toString?.() ||
        message?.workspaceId?.toString?.() ||
        message?.workspaceId;

      if (!workspaceId) return;

      Workspace.findById(workspaceId)
        .select("members")
        .lean()
        .then((workspace: any) => {
          const workspaceMembers = Array.isArray(workspace?.members)
            ? workspace.members
            : [];

          const mentionIds = normalizeMentionIds(message?.mentions);
          const payload = {
            channelId,
            messageId: message?._id,
            userId:
              message?.userId?._id?.toString?.() ||
              message?.userId?.toString?.() ||
              message?.userId,
            lastMessageAt: message?.createdAt,
            lastMessageText: message?.content || "",
            lastMessageSenderName: resolveSenderName(message),
            mentions: mentionIds,
          };

          workspaceMembers.forEach((memberId: any) => {
            const userId = memberId?.toString?.();
            if (userId) {
              io.to(`user:${userId}`).emit("channel:activity:update", payload);
            }
          });
        })
        .catch(() => {
          // Best-effort realtime signal; ignore failures to avoid interrupting message delivery.
        });
    }
  });

  realtimeBus.on("message:update", (message: any) => {
    const channelId =
      message?.channelId?._id?.toString?.() ||
      message?.channelId?.toString?.() ||
      message?.channelId;
    if (channelId) {
      io.to(`channel:${channelId}`).emit("message:update", message);
    }
  });

  realtimeBus.on("message:delete", (payload: any) => {
    const channelId =
      payload?.channelId?._id?.toString?.() ||
      payload?.channelId?.toString?.() ||
      payload?.channelId;
    if (channelId) {
      io.to(`channel:${channelId}`).emit("message:delete", payload);
    }
  });

  realtimeBus.on("message:pin", (message: any) => {
    const channelId =
      message?.channelId?._id?.toString?.() ||
      message?.channelId?.toString?.() ||
      message?.channelId;
    if (channelId) {
      io.to(`channel:${channelId}`).emit("message:pin", message);
    }
  });

  realtimeBus.on("message:unpin", (message: any) => {
    const channelId =
      message?.channelId?._id?.toString?.() ||
      message?.channelId?.toString?.() ||
      message?.channelId;
    if (channelId) {
      io.to(`channel:${channelId}`).emit("message:unpin", message);
    }
  });

  realtimeBus.on("thread:reply:new", (payload: any) => {
    const channelId =
      payload?.channelId?._id?.toString?.() ||
      payload?.channelId?.toString?.() ||
      payload?.channelId;
    if (channelId) {
      io.to(`channel:${channelId}`).emit("thread:reply:new", payload);
    }
  });

  realtimeBus.on("thread:reply:update", (payload: any) => {
    const channelId =
      payload?.channelId?._id?.toString?.() ||
      payload?.channelId?.toString?.() ||
      payload?.channelId;
    if (channelId) {
      io.to(`channel:${channelId}`).emit("thread:reply:update", payload);
    }
  });

  realtimeBus.on("thread:reply:delete", (payload: any) => {
    const channelId =
      payload?.channelId?._id?.toString?.() ||
      payload?.channelId?.toString?.() ||
      payload?.channelId;
    if (channelId) {
      io.to(`channel:${channelId}`).emit("thread:reply:delete", payload);
    }
  });

  realtimeBus.on("reaction:add", (payload: any) => {
    const channelId =
      payload?.channelId?._id?.toString?.() ||
      payload?.channelId?.toString?.() ||
      payload?.channelId;
    if (channelId) {
      io.to(`channel:${channelId}`).emit("reaction:add", payload);
    }
  });

  realtimeBus.on("reaction:remove", (payload: any) => {
    const channelId =
      payload?.channelId?._id?.toString?.() ||
      payload?.channelId?.toString?.() ||
      payload?.channelId;
    if (channelId) {
      io.to(`channel:${channelId}`).emit("reaction:remove", payload);
    }
  });
};

export const handleMessageSocket = (_io: Server, socket: Socket) => {
  socket.on("message:new", async (payload, ack) => {
    try {
      const userId = socket.data.user?.id;
      if (!userId) throw new Error("Unauthenticated");

      const channelId = payload?.channelId;
      const content =
        typeof payload?.content === "string" ? payload.content : "";
      const attachments = Array.isArray(payload?.attachments)
        ? payload.attachments
        : [];
      if (!channelId) {
        throw new Error("channelId is required");
      }
      if (!content.trim() && attachments.length === 0) {
        throw new Error("Message content cannot be empty");
      }

      const message = await MessageService.sendMessage({
        channelId,
        userId,
        content,
        attachments,
        mentions: payload?.mentions || [],
        type: payload.type || "text",
      });

      ack?.({ success: true, data: message });
    } catch (error: any) {
      ack?.({ success: false, message: error.message });
      socket.emit("socket:error", {
        event: "message:new",
        message: error.message,
      });
    }
  });

  socket.on("message:update", async (payload, ack) => {
    try {
      const userId = socket.data.user?.id;
      if (!userId) throw new Error("Unauthenticated");

      const messageId = payload?.messageId;
      const content =
        typeof payload?.content === "string" ? payload.content : "";
      if (!messageId) {
        throw new Error("messageId is required");
      }
      if (!content.trim()) {
        throw new Error("content is required");
      }

      const message = await MessageService.editMessage({
        messageId,
        userId,
        content,
      });

      ack?.({ success: true, data: message });
    } catch (error: any) {
      ack?.({ success: false, message: error.message });
      socket.emit("socket:error", {
        event: "message:update",
        message: error.message,
      });
    }
  });

  socket.on("message:delete", async (payload, ack) => {
    try {
      const userId = socket.data.user?.id;
      if (!userId) throw new Error("Unauthenticated");

      const messageId = payload?.messageId;
      if (!messageId) {
        throw new Error("messageId is required");
      }

      const message = await MessageService.deleteMessage({
        messageId,
        userId,
      });

      ack?.({ success: true, data: message });
    } catch (error: any) {
      ack?.({ success: false, message: error.message });
      socket.emit("socket:error", {
        event: "message:delete",
        message: error.message,
      });
    }
  });
};
