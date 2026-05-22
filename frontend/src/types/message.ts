export type MessageType = 'text' | 'file' | 'system' | 'meeting';

export interface MessageAttachment {
  url: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface MessageAuthor {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string;
}

export interface ChatMessage {
  _id: string;
  workspaceId: string;
  channelId: string;
  userId: string;
  type: MessageType;
  content: string;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  threadCount: number;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  mentions?: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  author?: MessageAuthor;
}

export interface MessagePageMeta {
  limit: number;
  count: number;
  hasMore: boolean;
  nextBefore: string | null;
  nextAfter: string | null;
}

export interface MessageListResponse {
  success: boolean;
  data: ChatMessage[];
  meta: MessagePageMeta;
}
