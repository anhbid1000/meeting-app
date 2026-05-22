import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFileAsset extends Document {
  workspaceId: Types.ObjectId;
  channelId: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  originalName: string;
  mimeType: string;
  size: number;
  cloudinaryResourceType: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  downloadUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const fileAssetSchema = new Schema<IFileAsset>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
      trim: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
      trim: true,
    },
    cloudinaryResourceType: {
      type: String,
      enum: ['image', 'video', 'raw'],
      default: 'raw',
    },
    downloadUrl: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

fileAssetSchema.index({ workspaceId: 1, createdAt: -1 });
fileAssetSchema.index({ workspaceId: 1, channelId: 1, createdAt: -1 });

export default mongoose.model<IFileAsset>('FileAsset', fileAssetSchema);
