// src/models/AccessRequest.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export type AccessRequestType   = 'invite' | 'request';
export type AccessRequestStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'revoked';

export interface IAccessRequest extends Document {
  /** Channel mà request nhắm tới (phải là private) */
  channelId: Types.ObjectId;
  /** Workspace chứa channel – dùng để query nhanh */
  workspaceId: Types.ObjectId;
  /** Người tạo request (inviteer hoặc applicant) */
  senderId: Types.ObjectId;
  /** Người nhận invite (null nếu là request) */
  recipientId?: Types.ObjectId | null;
  /** Loại request */
  type: AccessRequestType;
  /** Trạng thái hiện tại */
  status: AccessRequestStatus;
  /** Lý do / lời nhắn (tùy chọn, dùng cho request) */
  message?: string;
  /** Thời gian tạo */
  createdAt: Date;
  /** Thời gian cập nhật (đổi status) */
  updatedAt: Date;
}

/* -------------------------------------------------------------
   Schema
   ------------------------------------------------------------- */
const accessRequestSchema = new Schema<IAccessRequest>(
  {
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
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    type: {
      type: String,
      enum: ['invite', 'request'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired', 'revoked'],
      default: 'pending'
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

/* -------------------------------------------------------------
   Indexes (để tra cứu nhanh)
   ------------------------------------------------------------- */
// 1️⃣ Tất cả request chưa xử lý của 1 channel (để hiển thị ở UI)
accessRequestSchema.index({ channelId: 1, status: 1 });

// 2️⃣ Request mà một user nhận được (invite) hoặc gửi (request)
accessRequestSchema.index({ recipientId: 1, status: 1 });
accessRequestSchema.index({ senderId: 1, status: 1 });

export default mongoose.model<IAccessRequest>('AccessRequest', accessRequestSchema);