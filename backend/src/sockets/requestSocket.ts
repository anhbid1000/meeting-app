import { Server } from 'socket.io';
import { realtimeBus } from '../utils/realtime';
import Channel from '../models/Channel.model';
import Workspace from '../models/Workspace.model';
import ChannelJoinRequest from '../models/ChannelJoinRequest.model';

export const registerRequestBusHandlers = (io: Server) => {
  realtimeBus.on('join_request:new', async (payload: any) => {
    const channel = await Channel.findById(payload.channelId).select('workspaceId createdBy').lean();
    if (!channel) return;

    const workspace = await Workspace.findById(channel.workspaceId).select('ownerId').lean();
    const ownerId = workspace?.ownerId?.toString?.() || channel.createdBy?.toString?.();
    if (!ownerId) return;

    io.to(`user:${ownerId}`).emit('join_request:new', payload);
  });

  realtimeBus.on('join_request:approved', async (payload: any) => {
    const request = await ChannelJoinRequest.findById(payload.requestId)
      .select('senderId channelId')
      .lean();
    if (!request) return;

    io.to(`user:${request.senderId.toString()}`).emit('join_request:approved', {
      ...payload,
      channelId: request.channelId
    });
  });

  realtimeBus.on('join_request:rejected', async (payload: any) => {
    const request = await ChannelJoinRequest.findById(payload.requestId)
      .select('senderId channelId')
      .lean();
    if (!request) return;

    io.to(`user:${request.senderId.toString()}`).emit('join_request:rejected', {
      ...payload,
      channelId: request.channelId
    });
  });
};
