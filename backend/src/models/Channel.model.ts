import mongoose, {Schema, Document, Types} from "mongoose";

export type ChannelType = "private" | "public";

export interface IChannel extends Document {
  workspaceId: Types.ObjectId;
  name: string;
  description?: string;
  slug: string;
  type: ChannelType;
  createdBy: Types.ObjectId;
  members: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<IChannel>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true
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
    ]
  },
  { timestamps: true }
);

channelSchema.index({ workspaceId: 1, slug: 1 }, { unique: true });

export default mongoose.model<IChannel>('Channel', channelSchema);