export type NotificationType =
  | 'join_request'
  | 'request_approved'
  | 'message'
  | 'mention'
  | 'thread_reply'
  | 'meeting_start';

export interface NotificationItem {
  _id: string;
  userId: string;
  workspaceId: string;
  type: NotificationType;
  relatedUserId?: string;
  relatedChannelId?: string;
  relatedMessageId?: string;
  relatedRequestId?: string;
  title: string;
  description?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}
