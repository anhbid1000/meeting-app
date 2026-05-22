import api from './api';
import type { MyWorkspacesResponse } from '@/types/workspace';

export const workspaceApi = {
  async getMyWorkspaces(page = 1, limit = 50): Promise<MyWorkspacesResponse> {
    const response = await api.get(`/api/v1/workspaces/me?page=${page}&limit=${limit}`);
    return response.data;
  },
};

export default workspaceApi;
