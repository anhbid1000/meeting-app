import mongoose, { Schema, Document, Types } from 'mongoose';

export type MessageType = 'text' | 'file' | 'system' | 'meeting';

export interface IMessageAttachment {
  url: string;
  name: string;
  mimeType: string;
  size: number;
  fileId?: string;
}

export interface IMessage extends Document {
  workspaceId: Types.ObjectId;
  channelId: Types.ObjectId;
  userId: Types.ObjectId;
  type: MessageType;
  content: string;
  attachments?: IMessageAttachment[];
  threadCount: number;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  mentions?: Types.ObjectId[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageAttachmentSchema = new Schema<IMessageAttachment>(
  {
    fileId: { type: String },
    url: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

const messageSchema = new Schema<IMessage>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'file', 'system', 'meeting'],
      default: 'text'
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true
    },
    attachments: {
      type: [messageAttachmentSchema],
      default: []
    },
    threadCount: {
      type: Number,
      default: 0
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    },
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isPinned: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Indexes
messageSchema.index({ channelId: 1, createdAt: -1 });
messageSchema.index({ content: 'text' });
messageSchema.index({ channelId: 1, isPinned: 1 });

export default mongoose.model<IMessage>('Message', messageSchema);