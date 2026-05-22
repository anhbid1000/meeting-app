export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  members: string[];
  plan: 'standard' | 'pro';
  channelCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MyWorkspacesResponse {
  data: Workspace[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
