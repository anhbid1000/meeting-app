import mongoose, { Schema, Document, Types } from "mongoose";

export type ChannelType = "private" | "public";

export interface IChannel extends Document {
  workspaceId: Types.ObjectId;
  name: string;
  description?: string;
  slug: string;
  type: ChannelType;
  category?: string;
  createdBy: Types.ObjectId;
  members: Types.ObjectId[];
  isArchived: boolean;
  lastMessageAt?: Date;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<IChannel>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    type: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isArchived: {
      type: Boolean,
      default: false
    },
    lastMessageAt: {
      type: Date
    },
    memberCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Indexes
channelSchema.index({ workspaceId: 1, slug: 1 }, { unique: true });
channelSchema.index({ workspaceId: 1, type: 1 });
channelSchema.index({ lastMessageAt: -1 });

export default mongoose.model<IChannel>('Channel', channelSchema);