import mongoose, { Schema, Document, Types } from 'mongoose';

export type WorkspacePlan = 'standard' | 'pro';

export interface IWorkspace extends Document {
  name: string;
  slug: string;
  description?: string;
  ownerId: Types.ObjectId;
  members: Types.ObjectId[];
  plan: WorkspacePlan;
  channelCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    ownerId: {
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
    plan: {
      type: String,
      enum: ['standard', 'pro'],
      default: 'standard'
    },
    channelCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

workspaceSchema.index({ slug: 1 }, { unique: true });
workspaceSchema.index({ members: 1, updatedAt: -1 });

export default mongoose.model<IWorkspace>('Workspace', workspaceSchema);