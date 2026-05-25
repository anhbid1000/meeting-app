import { Server, Socket } from 'socket.io';

export const handleTypingSocket = (_io: Server, socket: Socket) => {
  socket.on('typing:start', (payload: { channelId: string }, ack) => {
    const userId = socket.data.user?.id;
    if (!userId || !payload?.channelId) {
      ack?.({ success: false, message: 'Missing user or channelId' });
      return;
    }

    socket.to(`channel:${payload.channelId}`).emit('typing:start', {
      channelId: payload.channelId,
      userId
    });
    ack?.({ success: true });
  });

  socket.on('typing:stop', (payload: { channelId: string }, ack) => {
    const userId = socket.data.user?.id;
    if (!userId || !payload?.channelId) {
      ack?.({ success: false, message: 'Missing user or channelId' });
      return;
    }

    socket.to(`channel:${payload.channelId}`).emit('typing:stop', {
      channelId: payload.channelId,
      userId
    });
    ack?.({ success: true });
  });
};
