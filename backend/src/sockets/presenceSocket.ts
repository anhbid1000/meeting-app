import { Server, Socket } from "socket.io";

const userSockets = new Map<string, Set<string>>();
const socketChannels = new Map<string, Set<string>>();
const socketUsers = new Map<string, string>();
const userIdleTimers = new Map<string, NodeJS.Timeout>();
const userIsIdle = new Map<string, boolean>();

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

const emitPresence = (
  io: Server,
  userId: string,
  status: "online" | "offline",
) => {
  io.emit("presence:update", { userId, status });
};

const scheduleIdleTimeout = (io: Server, userId: string) => {
  const existing = userIdleTimers.get(userId);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(() => {
    if (!isUserOnline(userId)) return;
    userIsIdle.set(userId, true);
    emitPresence(io, userId, "offline");
  }, IDLE_TIMEOUT_MS);

  userIdleTimers.set(userId, timer);
};

const markActive = (io: Server, userId: string) => {
  const wasIdle = userIsIdle.get(userId) === true;
  userIsIdle.set(userId, false);
  scheduleIdleTimeout(io, userId);
  if (wasIdle) {
    emitPresence(io, userId, "online");
  }
};

export const isUserOnline = (userId: string) => {
  return (userSockets.get(userId)?.size || 0) > 0;
};

export const getOnlineUserIds = () => {
  return Array.from(userSockets.keys()).filter(isUserOnline);
};

export const trackSocketChannel = (socketId: string, channelId: string) => {
  const channels = socketChannels.get(socketId) || new Set<string>();
  channels.add(channelId);
  socketChannels.set(socketId, channels);
};

export const untrackSocketChannel = (socketId: string, channelId: string) => {
  const channels = socketChannels.get(socketId);
  if (!channels) return;
  channels.delete(channelId);
  if (channels.size === 0) socketChannels.delete(socketId);
};

export const handlePresenceSocket = (io: Server, socket: Socket) => {
  const userId = socket.data.user?.id;
  if (!userId) return;
  socketUsers.set(socket.id, userId);

  const sockets = userSockets.get(userId) || new Set<string>();
  const wasOffline = sockets.size === 0;
  sockets.add(socket.id);
  userSockets.set(userId, sockets);
  markActive(io, userId);

  socket.emit("presence:self", {
    userId,
    status: "online",
    onlineUsers: getOnlineUserIds(),
  });

  if (wasOffline) {
    emitPresence(io, userId, "online");
  }

  socket.on("presence:activity", () => {
    markActive(io, userId);
  });

  socket.on("disconnect", () => {
    const currentSockets = userSockets.get(userId);
    if (currentSockets) {
      currentSockets.delete(socket.id);
      if (currentSockets.size === 0) {
        userSockets.delete(userId);
      }
    }

    const becameOffline = !isUserOnline(userId);
    const joinedChannels = socketChannels.get(socket.id) || new Set<string>();

    if (becameOffline) {
      const idleTimer = userIdleTimers.get(userId);
      if (idleTimer) clearTimeout(idleTimer);
      userIdleTimers.delete(userId);
      userIsIdle.delete(userId);

      if (joinedChannels.size > 0) {
        joinedChannels.forEach((channelId) => {
          io.to(`channel:${channelId}`).emit("presence:update", {
            userId,
            channelId,
            status: "offline",
          });
        });
      } else {
        emitPresence(io, userId, "offline");
      }
    }

    socketUsers.delete(socket.id);
    socketChannels.delete(socket.id);
  });
};
