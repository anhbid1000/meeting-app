import { Server } from "socket.io";
import { realtimeBus } from "../utils/realtime";

const resolveUserId = (payload: any) => {
  return (
    payload?.userId?._id?.toString?.() ||
    payload?.userId?.toString?.() ||
    payload?.userId
  );
};

export const registerNotificationBusHandlers = (io: Server) => {
  realtimeBus.on("notification:new", (payload: any) => {
    const userId = resolveUserId(payload);
    if (userId) {
      io.to(`user:${userId}`).emit("notification:new", payload);
    }
  });

  realtimeBus.on("notification:update", (payload: any) => {
    const userId = resolveUserId(payload);
    if (userId) {
      io.to(`user:${userId}`).emit("notification:update", payload);
    }
  });

  realtimeBus.on("notification:delete", (payload: any) => {
    const userId = resolveUserId(payload);
    if (userId) {
      io.to(`user:${userId}`).emit("notification:delete", payload);
    }
  });
};
