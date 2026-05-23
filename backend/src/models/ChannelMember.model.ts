import mongoose, { Schema, Document, Types } from "mongoose";

export interface IChannelMember extends Document {
  channelId: Types.ObjectId;
  userId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  lastReadAt?: Date;
  isMuted: boolean;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const channelMemberSchema = new Schema<IChannelMember>(
  {
    channelId: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
      index: true
    },
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
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastReadAt: {
      type: Date
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    isFavorite: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Indexes
channelMemberSchema.index({ channelId: 1, userId: 1 }, { unique: true });
channelMemberSchema.index({ userId: 1, workspaceId: 1 });
channelMemberSchema.index({ channelId: 1, role: 1 });

export default mongoose.model<IChannelMember>('ChannelMember', channelMemberSchema);