import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessageReaction extends Document {
  messageId: Types.ObjectId;
  channelId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  userId: Types.ObjectId;
  emoji: string;
  createdAt: Date;
}

const messageReactionSchema = new Schema<IMessageReaction>(
  {
    messageId: {
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
      required: true,
      index: true
    },
    emoji: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageReactionSchema.index({ messageId: 1, emoji: 1 });
messageReactionSchema.index({ messageId: 1, userId: 1, emoji: 1 }, { unique: true });

export default mongoose.model<IMessageReaction>('MessageReaction', messageReactionSchema);