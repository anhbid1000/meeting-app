import { Server, Socket } from "socket.io";
import { PermissionService } from "../services/Permission.service";
import { trackSocketChannel, untrackSocketChannel } from "./presenceSocket";
import { realtimeBus } from "../utils/realtime";

export const registerChannelBusHandlers = (io: Server) => {
  realtimeBus.on("channel:member:added", (payload: any) => {
    const channelId = payload?.channelId?.toString?.() || payload?.channelId;
    if (!channelId) return;
    io.to(`channel:${channelId}`).emit("channel:member:added", {
      channelId,
      user: payload?.user,
      role: payload?.role,
    });
  });

  realtimeBus.on("channel:member:removed", (payload: any) => {
    const channelId = payload?.channelId?.toString?.() || payload?.channelId;
    if (!channelId) return;
    io.to(`channel:${channelId}`).emit("channel:member:removed", {
      channelId,
      user: payload?.user,
    });
  });
};

export const handleChannelSocket = (_io: Server, socket: Socket) => {
  socket.on(
    "channel:join",
    async (payload: { channelId: string } | string, ack) => {
      try {
        const userId = socket.data.user?.id;
        const channelId =
          typeof payload === "string" ? payload : payload?.channelId;
        if (!userId || !channelId) {
          throw new Error("Missing user or channelId");
        }

        const canJoin = await PermissionService.canSendMessage(
          userId,
          channelId,
        );
        if (!canJoin) {
          throw new Error(
            "Forbidden: you must be a channel member to join realtime room",
          );
        }

        socket.join(`channel:${channelId}`);
        trackSocketChannel(socket.id, channelId);

        ack?.({ success: true, channelId });
      } catch (error: any) {
        ack?.({ success: false, message: error.message });
        socket.emit("socket:error", {
          event: "channel:join",
          message: error.message,
        });
      }
    },
  );

  socket.on("channel:leave", (payload: { channelId: string } | string, ack) => {
    const userId = socket.data.user?.id;
    const channelId =
      typeof payload === "string" ? payload : payload?.channelId;
    if (!userId || !channelId) {
      ack?.({ success: false, message: "Missing user or channelId" });
      return;
    }

    socket.leave(`channel:${channelId}`);
    untrackSocketChannel(socket.id, channelId);

    ack?.({ success: true, channelId });
  });
};
