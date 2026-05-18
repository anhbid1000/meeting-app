
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  /** Workspace mà kênh này thuộc (để query nhanh theo workspace) */
  workspaceId: Types.ObjectId;
  /** Kênh mà tin nhắn được gửi vào */
  channelId: Types.ObjectId;
  /** Người gửi – luôn là một User */
  userId: Types.ObjectId;
  /** Nội dung tin nhắn, tối đa 2000 ký tự */
  content: string;
  /** Khi nào tin nhắn được tạo (được tạo tự động bởi timestamps) */
  createdAt: Date;
  /** Khi nào tin nhắn bị sửa (nếu có) */
  updatedAt: Date;
}

/* -------------------------------------------------------------
   Schema
   ------------------------------------------------------------- */
const messageSchema = new Schema<IMessage>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true               // query messages của một workspace nhanh
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
      index: true               // cần cho compound index dưới
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true
    }
  },
  {
    timestamps: true            // tự động tạo createdAt / updatedAt
  }
);

// Index
messageSchema.index({ channelId: 1, createdAt: -1 });

// 2Full‑text search trên nội dung tin nhắn (Atlas Search / text index)
messageSchema.index({ content: 'text' });

export default mongoose.model<IMessage>('Message', messageSchema);