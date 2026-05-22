import { create } from 'zustand';
import type { Socket } from 'socket.io-client';

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  activeRoom: string | null;
  setSocket: (socket: Socket | null) => void;
  setConnected: (connected: boolean) => void;
  joinRoom: (channelId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  emitMessage: (payload: {
    channelId: string;
    content: string;
    attachments?: Array<{
      url: string;
      name: string;
      mimeType: string;
      size: number;
    }>;
    mentions?: string[];
  }) => Promise<{ success: boolean; data?: unknown; message?: string }>;
  emitTyping: (channelId: string, isTyping: boolean) => Promise<void>;
}

const ackAsPromise = <T = unknown>(
  emitter: (ack: (response: T) => void) => void
): Promise<T> => {
  return new Promise((resolve) => {
    emitter((response) => resolve(response));
  });
};

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  activeRoom: null,

  setSocket: (socket) => set({ socket }),
  setConnected: (connected) => set({ isConnected: connected }),

  joinRoom: async (channelId) => {
    const { socket, activeRoom } = get();
    if (!socket || !socket.connected || activeRoom === channelId) return;

    if (activeRoom) {
      await ackAsPromise((ack) =>
        socket.emit('channel:leave', { channelId: activeRoom }, ack)
      );
    }

    await ackAsPromise((ack) =>
      socket.emit('channel:join', { channelId }, ack)
    );
    set({ activeRoom: channelId });
  },

  leaveRoom: async () => {
    const { socket, activeRoom } = get();
    if (!socket || !socket.connected || !activeRoom) return;

    await ackAsPromise((ack) =>
      socket.emit('channel:leave', { channelId: activeRoom }, ack)
    );
    set({ activeRoom: null });
  },

  emitMessage: async (payload) => {
    const { socket } = get();
    if (!socket || !socket.connected) {
      return { success: false, message: 'Socket not connected' };
    }

    const response = await ackAsPromise<{
      success: boolean;
      data?: unknown;
      message?: string;
    }>((ack) => socket.emit('message:new', payload, ack));

    return response;
  },

  emitTyping: async (channelId, isTyping) => {
    const { socket } = get();
    if (!socket || !socket.connected || !channelId) return;

    await ackAsPromise((ack) =>
      socket.emit(isTyping ? 'typing:start' : 'typing:stop', { channelId }, ack)
    );
  },
}));
