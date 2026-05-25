import { Server } from "socket.io";
import { socketAuthMiddleware } from "../middlewares/socket.middleware";
import {
  handleChannelSocket,
  registerChannelBusHandlers,
} from "./channelSocket";
import {
  handleMessageSocket,
  registerMessageBusHandlers,
} from "./messageSocket";
import { handleTypingSocket } from "./typingSocket";
import { handlePresenceSocket } from "./presenceSocket";
import { registerRequestBusHandlers } from "./requestSocket";
import {
  handleMeetingSocket,
  registerMeetingBusHandlers,
} from "./meetingSocket";
import { registerNotificationBusHandlers } from "./notificationSocket";

export const setupSocketHandlers = (io: Server) => {
  io.use(socketAuthMiddleware as any);

  registerMessageBusHandlers(io);
  registerChannelBusHandlers(io);
  registerRequestBusHandlers(io);
  registerMeetingBusHandlers(io);
  registerNotificationBusHandlers(io);

  io.on("connection", (socket) => {
    const userId = socket.data.user?.id;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    handlePresenceSocket(io, socket);
    handleChannelSocket(io, socket);
    handleMessageSocket(io, socket);
    handleTypingSocket(io, socket);
    handleMeetingSocket(io, socket);

    socket.on("disconnect", () => {
      // presence handler already manages offline signaling
      // keep this for logging/debugging
      console.log("Socket disconnected:", socket.id);
    });
  });
};
