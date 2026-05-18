// src/models/WorkspaceInvite.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export type WorkspaceInviteStatus =
  | 'pending'
  | 'active'
  | 'rejected'
  | 'revoked'
  | 'expired';

export interface IWorkspaceInvite extends Document {
  workspaceId: Types.ObjectId;
  code: string;

  createdBy: Types.ObjectId;

  status: WorkspaceInviteStatus;

  maxUses?: number | null;
  usedCount: number;

  expiresAt?: Date | null;

  reviewedBy?: Types.ObjectId | null;
  reviewedAt?: Date | null;
  rejectReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const workspaceInviteSchema = new Schema<IWorkspaceInvite>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'revoked', 'expired'],
      default: 'pending'
    },
    maxUses: {
      type: Number,
      default: null,
      min: 1
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    expiresAt: {
      type: Date,
      default: null
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    rejectReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    }
  },
  { timestamps: true }
);

workspaceInviteSchema.index({ workspaceId: 1, status: 1 });
workspaceInviteSchema.index({ createdBy: 1, status: 1 });
workspaceInviteSchema.index({ code: 1 }, { unique: true });

export default mongoose.model<IWorkspaceInvite>(
  'WorkspaceInvite',
  workspaceInviteSchema
);