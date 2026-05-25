import api from './api';

export const notificationApi = {
  async getNotifications(query?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', String(query.page));
    if (query?.limit) params.append('limit', String(query.limit));
    if (query?.unreadOnly) params.append('unreadOnly', 'true');

    const response = await api.get(
      `/notifications${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  async markAsRead(notificationId: string) {
    const response = await api.patch(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  async deleteNotification(notificationId: string) {
    const response = await api.delete(
      `/notifications/${notificationId}`
    );
    return response.data;
  },
};

export default notificationApi;
