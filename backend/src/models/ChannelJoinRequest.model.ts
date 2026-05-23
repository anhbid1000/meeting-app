import mongoose, { Schema, Document, Types } from 'mongoose';

export type ChannelJoinRequestType = 'invite' | 'request';
export type ChannelJoinRequestStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'revoked';

export interface IChannelJoinRequest extends Document {
  channelId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  senderId: Types.ObjectId;
  recipientId?: Types.ObjectId | null;
  type: ChannelJoinRequestType;
  status: ChannelJoinRequestStatus;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const channelJoinRequestSchema = new Schema<IChannelJoinRequest>(
  {
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
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    type: {
      type: String,
      enum: ['invite', 'request'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired', 'revoked'],
      default: 'pending'
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    }
  },
  { timestamps: true }
);

channelJoinRequestSchema.index({ channelId: 1, status: 1 });
channelJoinRequestSchema.index({ recipientId: 1, status: 1 });
channelJoinRequestSchema.index({ senderId: 1, status: 1 });
channelJoinRequestSchema.index({ channelId: 1, senderId: 1, status: 1 });

export default mongoose.model<IChannelJoinRequest>('ChannelJoinRequest', channelJoinRequestSchema);