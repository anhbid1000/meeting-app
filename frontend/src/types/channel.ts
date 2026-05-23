export interface Channel {
  _id: string;
  workspaceId: string;
  name: string;
  description?: string;
  slug: string;
  type: 'public' | 'private';
  category?: string;
  createdBy: string;
  members: string[];
  isArchived: boolean;
  lastMessageAt?: string;
  memberCount: number;
  unreadCount?: number;
  mentionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelJoinRequest {
  _id: string;
  channelId: string;
  workspaceId: string;
  senderId: string;
  recipientId?: string;
  type: 'invite' | 'request';
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'revoked';
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelMember {
  _id: string;
  channelId: string;
  userId: string;
  workspaceId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  lastReadAt?: string;
  isMuted: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelDirectoryQuery {
  search?: string;
  type?: 'public' | 'private';
  category?: string;
  page?: number;
  limit?: number;
  sort?: 'activity' | 'name' | 'createdAt' | 'memberCount';
}

export interface ChannelDirectoryResponse {
  success: boolean;
  data: {
    channels: Channel[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
