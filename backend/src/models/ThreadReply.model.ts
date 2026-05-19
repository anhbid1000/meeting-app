import mongoose, { Schema, Document, Types } from 'mongoose';
import { IMessageAttachment } from './Message.model';

export interface IThreadReply extends Document {
  parentMessageId: Types.ObjectId;
  channelId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  attachments?: IMessageAttachment[];
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const replyAttachmentSchema = new Schema<IMessageAttachment>(
  {
    url: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    size: { type: Number, required: true }
  },
  { _id: false }
);

const threadReplySchema = new Schema<IThreadReply>(
  {
    parentMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      required: true,
      index: true
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
      index: true
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true
    },
    attachments: {
      type: [replyAttachmentSchema],
      default: []
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date
  },
  { timestamps: true }
);

threadReplySchema.index({ parentMessageId: 1, createdAt: -1 });

export default mongoose.model<IThreadReply>('ThreadReply', threadReplySchema);