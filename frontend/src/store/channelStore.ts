import { create } from 'zustand';
import { Channel, ChannelJoinRequest } from '@/types/channel';

interface ChannelFilters {
  search?: string;
  type?: 'public' | 'private';
  category?: string;
  status?: 'all' | 'joined' | 'unread' | 'favorites';
  page: number;
  limit: number;
  sort?: 'activity' | 'name' | 'memberCount';
}

interface ChannelStore {
  channels: Channel[];
  currentChannel: Channel | null;
  isLoading: boolean;
  error: string | null;
  filters: ChannelFilters;
  pendingRequests: ChannelJoinRequest[];
  selectedRequestId: string | null;
  totalPages: number;
  total: number;

  // Actions
  setChannels: (channels: Channel[]) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  addChannel: (channel: Channel) => void;
  updateChannel: (channelId: string, updates: Partial<Channel>) => void;
  removeChannel: (channelId: string) => void;
  setFilters: (filters: Partial<ChannelFilters>) => void;
  resetFilters: () => void;
  setPendingRequests: (requests: ChannelJoinRequest[]) => void;
  addPendingRequest: (request: ChannelJoinRequest) => void;
  removePendingRequest: (requestId: string) => void;
  setSelectedRequestId: (requestId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setMeta: (meta: { total: number; totalPages: number }) => void;
}

const defaultFilters: ChannelFilters = {
  page: 1,
  limit: 20,
  sort: 'activity'
};

export const useChannelStore = create<ChannelStore>((set) => ({
  channels: [],
  currentChannel: null,
  isLoading: false,
  error: null,
  filters: defaultFilters,
  pendingRequests: [],
  selectedRequestId: null,
  totalPages: 0,
  total: 0,

  setChannels: (channels) => set({ channels }),

  setCurrentChannel: (channel) => set({ currentChannel: channel }),

  addChannel: (channel) =>
    set((state) => ({
      channels: [channel, ...state.channels],
      total: state.total + 1
    })),

  updateChannel: (channelId, updates) =>
    set((state) => ({
      channels: state.channels.map((ch) =>
        ch._id === channelId ? { ...ch, ...updates } : ch
      ),
      currentChannel:
        state.currentChannel?._id === channelId
          ? { ...state.currentChannel, ...updates }
          : state.currentChannel
    })),

  removeChannel: (channelId) =>
    set((state) => ({
      channels: state.channels.filter((ch) => ch._id !== channelId),
      currentChannel:
        state.currentChannel?._id === channelId ? null : state.currentChannel,
      total: Math.max(0, state.total - 1)
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters }
    })),

  resetFilters: () => set({ filters: defaultFilters }),

  setPendingRequests: (requests) => set({ pendingRequests: requests }),

  addPendingRequest: (request) =>
    set((state) => ({
      pendingRequests: [request, ...state.pendingRequests]
    })),

  removePendingRequest: (requestId) =>
    set((state) => ({
      pendingRequests: state.pendingRequests.filter((req) => req._id !== requestId)
    })),

  setSelectedRequestId: (requestId) => set({ selectedRequestId: requestId }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setMeta: (meta) => set({ totalPages: meta.totalPages, total: meta.total })
}));
