import { Server, Socket } from 'socket.io';

const userSockets = new Map<string, Set<string>>();
const socketChannels = new Map<string, Set<string>>();

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

  const sockets = userSockets.get(userId) || new Set<string>();
  const wasOffline = sockets.size === 0;
  sockets.add(socket.id);
  userSockets.set(userId, sockets);

  socket.emit('presence:self', {
    userId,
    status: 'online',
    onlineUsers: getOnlineUserIds()
  });

  if (wasOffline) {
    io.emit('presence:update', { userId, status: 'online' });
  }

  socket.on('disconnect', () => {
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
      if (joinedChannels.size > 0) {
        joinedChannels.forEach((channelId) => {
          io.to(`channel:${channelId}`).emit('presence:update', {
            userId,
            channelId,
            status: 'offline'
          });
        });
      } else {
        io.emit('presence:update', { userId, status: 'offline' });
      }
    }

    socketChannels.delete(socket.id);
  });
};
