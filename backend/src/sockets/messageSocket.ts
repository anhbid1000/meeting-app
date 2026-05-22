import { Server, Socket } from "socket.io";
import { MessageService } from "../services/Message.service";
import { realtimeBus } from "../utils/realtime";

export const registerMessageBusHandlers = (io: Server) => {
  realtimeBus.on("message:new", (message: any) => {
    const channelId =
      message?.channelId?._id?.toString?.() ||
      message?.channelId?.toString?.() ||
      message?.channelId;
    if (channelId) {
      io.to(`channel:${channelId}`).emit("message:new", message);
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
