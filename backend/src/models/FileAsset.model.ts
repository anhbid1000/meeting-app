import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFileAsset extends Document {
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedBy: Types.ObjectId;
  channelId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  messageId?: Types.ObjectId;
  createdAt: Date;
}

const fileAssetSchema = new Schema<IFileAsset>(
  {
    cloudinaryUrl: {
      type: String,
      required: true
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
      index: true
    },
    fileName: {
      type: String,
      required: true,
      trim: true
    },
    mimeType: {
      type: String,
      required: true,
      trim: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
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
    messageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message'
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

fileAssetSchema.index({ channelId: 1, createdAt: -1 });

export default mongoose.model<IFileAsset>('FileAsset', fileAssetSchema);