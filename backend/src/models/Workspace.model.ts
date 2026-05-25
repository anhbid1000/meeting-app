import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { WorkspaceRole } from "../types";

export type WorkspacePlan = 'free' | 'pro';

export interface IWorkspace extends Document {
  name: string;
  slug: string;
  description?: string;
  category: Types.ObjectId; // Reference to Category
  ownerId: Types.ObjectId;
  members: {
    userId: Types.ObjectId;
    role: WorkspaceRole;
    joinedAt: Date;
  }[];
  plan: WorkspacePlan;
  channelCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceMemberSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "owner", "member", "pending"],
      default: "pending",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: {
      type: [workspaceMemberSchema],
      default: [],
    },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    channelCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

workspaceSchema.index({ "members.userId": 1, updatedAt: -1 });

const Workspace: Model<IWorkspace> =
  mongoose.models.Workspace || mongoose.model<IWorkspace>("Workspace", workspaceSchema);

export default Workspace;
