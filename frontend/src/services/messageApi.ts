import api from './api';
import type { MessageListResponse } from '@/types/message';

export const messageApi = {
  async getMessages(
    channelId: string,
    query?: {
      limit?: number;
      before?: string;
      after?: string;
    }
  ): Promise<MessageListResponse> {
    const params = new URLSearchParams();
    if (query?.limit) params.append('limit', String(query.limit));
    if (query?.before) params.append('before', query.before);
    if (query?.after) params.append('after', query.after);

    const suffix = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(
      `/api/v1/channels/${channelId}/messages${suffix}`
    );
    return response.data;
  },

  async sendMessage(
    channelId: string,
    payload: {
      content: string;
      attachments?: Array<{
        url: string;
        name: string;
        mimeType: string;
        size: number;
      }>;
      mentions?: string[];
      type?: 'text' | 'file' | 'system' | 'meeting';
    }
  ) {
    const response = await api.post(
      `/api/v1/channels/${channelId}/messages`,
      payload
    );
    return response.data;
  },

  async editMessage(messageId: string, payload: { content: string }) {
    const response = await api.patch(`/api/v1/messages/${messageId}`, payload);
    return response.data;
  },

  async deleteMessage(messageId: string) {
    const response = await api.delete(`/api/v1/messages/${messageId}`);
    return response.data;
  },

  async pinMessage(messageId: string) {
    const response = await api.patch(`/api/v1/messages/${messageId}/pin`);
    return response.data;
  },

  async unpinMessage(messageId: string) {
    const response = await api.patch(`/api/v1/messages/${messageId}/unpin`);
    return response.data;
  },

  async getPinnedMessages(channelId: string) {
    const response = await api.get(`/api/v1/channels/${channelId}/pinned`);
    return response.data;
  },

  async addReaction(messageId: string, emoji: string) {
    const response = await api.post(`/api/v1/messages/${messageId}/reactions`, {
      emoji,
    });
    return response.data;
  },

  async removeReaction(messageId: string, emoji: string) {
    const encodedEmoji = encodeURIComponent(emoji);
    const response = await api.delete(
      `/api/v1/messages/${messageId}/reactions/${encodedEmoji}`
    );
    return response.data;
  },
};

export default messageApi;
