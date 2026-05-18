// src/models/ChannelMember.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export type ChannelMemberStatus = 'active' | 'left' | 'banned';
export type ChannelMemberRole   = 'owner' | 'admin' | 'member';

export interface IChannelMember extends Document {
  /** Channel mà thành viên này thuộc */
  channelId: Types.ObjectId;
  /** Workspace chứa channel (để query nhanh) */
  workspaceId: Types.ObjectId;
  /** Người dùng */
  userId: Types.ObjectId;
  /** Vai trò trong channel */
  role: ChannelMemberRole;
  /** Trạng thái hiện tại */
  status: ChannelMemberStatus;
  /** Thời điểm tham gia */
  joinedAt: Date;
  /** Thời điểm rời (null → still active) */
  leftAt?: Date | null;
  /** Khi nào bản ghi được tạo / cập nhật */
  createdAt: Date;
  updatedAt: Date;
}

/* -------------------------------------------------------------
   Schema
   ------------------------------------------------------------- */
const channelMemberSchema = new Schema<IChannelMember>(
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
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    status: {
      type: String,
      enum: ['active', 'left', 'banned'],
      default: 'active'
    },
    joinedAt: {
      type: Date,
      default: () => new Date()
    },
    leftAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/* -------------------------------------------------------------
   Indexes
   ------------------------------------------------------------- */
// 1️⃣ Đảm bảo mỗi (channel, user) chỉ có duy nhất một bản ghi
channelMemberSchema.index({ channelId: 1, userId: 1 }, { unique: true });

// 2️⃣ Tìm nhanh các thành viên đang active của 1 channel
channelMemberSchema.index({ channelId: 1, status: 1 });

// 3️⃣ Tìm nhanh các channel mà user đang tham gia
channelMemberSchema.index({ userId: 1, status: 1 });

export default mongoose.model<IChannelMember>('ChannelMember', channelMemberSchema);