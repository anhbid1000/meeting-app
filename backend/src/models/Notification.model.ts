import mongoose, { Schema, Document, Types } from 'mongoose';

export type NotificationType =
  | 'join_request'
  | 'request_approved'
  | 'message'
  | 'mention'
  | 'thread_reply'
  | 'meeting_start';

export interface INotification extends Document {
  userId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  type: NotificationType;
  relatedUserId?: Types.ObjectId;
  relatedChannelId?: Types.ObjectId;
  relatedMessageId?: Types.ObjectId;
  relatedRequestId?: Types.ObjectId;
  title: string;
  description?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['join_request', 'request_approved', 'message', 'mention', 'thread_reply', 'meeting_start'],
      required: true
    },
    relatedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    relatedChannelId: {
      type: Schema.Types.ObjectId,
      ref: 'Channel'
    },
    relatedMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message'
    },
    relatedRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'ChannelJoinRequest'
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: Date
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', notificationSchema);