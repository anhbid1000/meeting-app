import api from './api';
import type { ThreadReplyListResponse } from '@/types/message';

const threadReplyApi = {
  async getReplies(messageId: string, page = 1, limit = 100) {
    const response = await api.get<ThreadReplyListResponse>(
      `/api/v1/messages/${messageId}/replies?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async createReply(
    messageId: string,
    payload: {
      content: string;
      attachments?: Array<{
        url: string;
        name: string;
        mimeType: string;
        size: number;
      }>;
    }
  ) {
    const response = await api.post(
      `/api/v1/messages/${messageId}/replies`,
      payload
    );
    return response.data;
  },

  async editReply(replyId: string, payload: { content: string }) {
    const response = await api.patch(`/api/v1/replies/${replyId}`, payload);
    return response.data;
  },

  async deleteReply(replyId: string) {
    const response = await api.delete(`/api/v1/replies/${replyId}`);
    return response.data;
  },
};

export default threadReplyApi;
