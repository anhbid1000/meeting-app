import api from './api';

/**
 * Channel Directory API
 */
export const channelApi = {
  /**
   * Get channel directory for a workspace with optional query params
   */
  async getChannelDirectory(
    workspaceId: string,
    query?: {
      search?: string;
      type?: 'public' | 'private';
      category?: string;
      page?: number;
      limit?: number;
      sort?: 'activity' | 'name' | 'memberCount' | 'createdAt';
    }
  ) {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.type) params.append('type', query.type);
    if (query?.category) params.append('category', query.category);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.sort) params.append('sort', query.sort);

    const response = await api.get(
      `/workspaces/${workspaceId}/channels?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get a single channel by ID
   */
  async getChannel(channelId: string) {
    const response = await api.get(`/channels/${channelId}`);
    return response.data;
  },

  async getChannelMembers(channelId: string, page = 1, limit = 200) {
    const response = await api.get(
      `/channels/${channelId}/members?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async getInviteCandidates(channelId: string) {
    const response = await api.get(
      `/channels/${channelId}/invite-candidates`
    );
    return response.data;
  },

  async inviteMember(channelId: string, userId: string) {
    const response = await api.post(`/channels/${channelId}/invite`, {
      userId,
    });
    return response.data;
  },

  /**
   * Create a new channel
   */
  async createChannel(
    workspaceId: string,
    data: {
      name: string;
      description?: string;
      type: 'public' | 'private';
      category?: string;
    }
  ) {
    const response = await api.post(
      `/workspaces/${workspaceId}/channels`,
      data
    );
    return response.data;
  },

  /**
   * Update a channel
   */
  async updateChannel(
    channelId: string,
    data: Partial<{
      name?: string;
      description?: string;
      type?: 'public' | 'private';
      category?: string;
      isArchived?: boolean;
    }>
  ) {
    const response = await api.patch(`/channels/${channelId}`, data);
    return response.data;
  },

  /**
   * Delete a channel
   */
  async deleteChannel(channelId: string) {
    await api.delete(`/channels/${channelId}`);
  },

  /**
   * Archive a channel
   */
  async archiveChannel(channelId: string) {
    const response = await api.patch(`/channels/${channelId}/archive`);
    return response.data;
  },

  /**
   * Join a public channel (no approval needed)
   */
  async joinChannel(channelId: string) {
    const response = await api.post(`/channels/${channelId}/join`);
    return response.data;
  },

  /**
   * Leave a channel
   */
  async leaveChannel(channelId: string) {
    await api.post(`/channels/${channelId}/leave`);
  },

  /**
   * Request access to a private channel
   */
  async requestAccess(channelId: string, message?: string) {
    const response = await api.post(`/channels/${channelId}/requests`, {
      message,
    });
    return response.data;
  },

  /**
   * Get pending join requests for a channel (owner/admin only)
   */
  async getPendingRequests(channelId: string, page = 1, limit = 20) {
    const response = await api.get(
      `/channels/${channelId}/requests?status=pending&page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Approve a join request
   */
  async approveRequest(channelId: string, requestId: string) {
    const response = await api.patch(
      `/channels/${channelId}/requests/${requestId}/approve`
    );
    return response.data;
  },

  /**
   * Reject a join request
   */
  async rejectRequest(channelId: string, requestId: string, reason?: string) {
    const response = await api.patch(
      `/channels/${channelId}/requests/${requestId}/reject`,
      { reason }
    );
    return response.data;
  },
  /**
   * Get user's pending join requests
   */
  async getMyPendingRequests() {
    const response = await api.get('/channels/my-pending-requests');
    return response.data;
  },

  /**
   * Get latest sent request status per channel for current user
   */
  async getMyRequests() {
    const response = await api.get('/channels/my-requests');
    return response.data;
  },

  /**
   * Toggle channel favorite for current user
   */
  async favoriteChannel(channelId: string, isFavorite: boolean) {
    const response = await api.patch(`/channels/${channelId}/favorite`, {
      isFavorite,
    });
    return response.data;
  },

  async markChannelRead(channelId: string, timestamp?: string) {
    const response = await api.patch(`/channels/${channelId}/read`, {
      timestamp,
    });
    return response.data;
  },
};

export default channelApi;
