import { Server, Socket } from 'socket.io';
import { PermissionService } from '../services/Permission.service';
import { trackSocketChannel, untrackSocketChannel } from './presenceSocket';

export const handleChannelSocket = (_io: Server, socket: Socket) => {
  socket.on('channel:join', async (payload: { channelId: string } | string, ack) => {
    try {
      const userId = socket.data.user?.id;
      const channelId = typeof payload === 'string' ? payload : payload?.channelId;
      if (!userId || !channelId) {
        throw new Error('Missing user or channelId');
      }

      const canJoin = await PermissionService.canSendMessage(userId, channelId);
      if (!canJoin) {
        throw new Error('Forbidden: you must be a channel member to join realtime room');
      }

      socket.join(`channel:${channelId}`);
      trackSocketChannel(socket.id, channelId);

      socket.to(`channel:${channelId}`).emit('presence:update', {
        userId,
        channelId,
        status: 'online'
      });

      ack?.({ success: true, channelId });
    } catch (error: any) {
      ack?.({ success: false, message: error.message });
      socket.emit('socket:error', { event: 'channel:join', message: error.message });
    }
  });

  socket.on('channel:leave', (payload: { channelId: string } | string, ack) => {
    const userId = socket.data.user?.id;
    const channelId = typeof payload === 'string' ? payload : payload?.channelId;
    if (!userId || !channelId) {
      ack?.({ success: false, message: 'Missing user or channelId' });
      return;
    }

    socket.leave(`channel:${channelId}`);
    untrackSocketChannel(socket.id, channelId);

    socket.to(`channel:${channelId}`).emit('presence:update', {
      userId,
      channelId,
      status: 'offline'
    });

    ack?.({ success: true, channelId });
  });
};
