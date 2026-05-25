import { Server, Socket } from "socket.io";
import { realtimeBus } from "../utils/realtime";
import ChannelMember from "../models/ChannelMember.model";
import Channel from "../models/Channel.model";
import { NotificationService } from "../services/Notification.service";

export const registerMeetingBusHandlers = (io: Server) => {
  realtimeBus.on("meeting:start", (payload: any) => {
    if (!payload?.channelId) return;
    io.to(`channel:${payload.channelId}`).emit("meeting:start", payload);
  });

  realtimeBus.on("meeting:end", (payload: any) => {
    if (!payload?.channelId) return;
    io.to(`channel:${payload.channelId}`).emit("meeting:end", payload);
  });
};

export const handleMeetingSocket = (_io: Server, socket: Socket) => {
  socket.on("meeting:start", (payload, ack) => {
    if (!payload?.channelId) {
      ack?.({ success: false, message: "Missing channelId" });
      return;
    }

    void (async () => {
      const channelId = String(payload.channelId);
      const channel = await Channel.findById(channelId)
        .select("workspaceId")
        .lean();
      const workspaceId = String(
        payload.workspaceId || channel?.workspaceId || "",
      );
      if (!workspaceId) return;

      const members = await ChannelMember.find({ channelId })
        .select("userId")
        .lean();

      const starterId = String(payload.createdBy || payload.userId || "");
      const title = String(payload.title || "Meeting started");

      await NotificationService.createManyNotifications(
        members
          .map((member: any) => String(member.userId))
          .filter((userId) => userId && userId !== starterId)
          .map((userId) => ({
            userId,
            workspaceId,
            type: "meeting_start" as const,
            title: "Meeting started in your channel",
            description: title,
            relatedUserId: starterId || undefined,
            relatedChannelId: channelId,
          })),
      );
    })().catch(() => {
      // Best-effort notification delivery; don't block meeting signaling.
    });

    socket.to(`channel:${payload.channelId}`).emit("meeting:start", payload);
    ack?.({ success: true });
  });

  socket.on("meeting:end", (payload, ack) => {
    if (!payload?.channelId) {
      ack?.({ success: false, message: "Missing channelId" });
      return;
    }
    socket.to(`channel:${payload.channelId}`).emit("meeting:end", payload);
    ack?.({ success: true });
  });
};
