import { Server, Socket } from 'socket.io';
import { realtimeBus } from '../utils/realtime';

export const registerMeetingBusHandlers = (io: Server) => {
  realtimeBus.on('meeting:start', (payload: any) => {
    if (!payload?.channelId) return;
    io.to(`channel:${payload.channelId}`).emit('meeting:start', payload);
  });

  realtimeBus.on('meeting:end', (payload: any) => {
    if (!payload?.channelId) return;
    io.to(`channel:${payload.channelId}`).emit('meeting:end', payload);
  });
};

export const handleMeetingSocket = (_io: Server, socket: Socket) => {
  socket.on('meeting:start', (payload, ack) => {
    if (!payload?.channelId) {
      ack?.({ success: false, message: 'Missing channelId' });
      return;
    }
    socket.to(`channel:${payload.channelId}`).emit('meeting:start', payload);
    ack?.({ success: true });
  });

  socket.on('meeting:end', (payload, ack) => {
    if (!payload?.channelId) {
      ack?.({ success: false, message: 'Missing channelId' });
      return;
    }
    socket.to(`channel:${payload.channelId}`).emit('meeting:end', payload);
    ack?.({ success: true });
  });
};
