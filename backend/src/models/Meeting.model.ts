import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  workspaceId: Types.ObjectId;
  channelId: Types.ObjectId;
  hostId: Types.ObjectId;
  livekitRoomName: string; // Tên room trên LiveKit (workspaceId-channelId-meetingId)
  status: 'live' | 'working' | 'ended';
  startedAt: Date;
  endedAt?: Date;
  description?: string;
  scheduledAt?: Date;
  reminderSentAt?: Date;
}

const meetingSchema = new Schema<IMeeting>({
  title: { type: String, required: true, trim: true },
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
  hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  livekitRoomName: { type: String, required: true, unique: true },
  status: { type: String, enum: ['live', 'working', 'ended'], default: 'live' },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  description: { type: String, trim: true },
  scheduledAt: { type: Date },
  reminderSentAt: { type: Date },
}, { timestamps: true });

meetingSchema.index({ workspaceId: 1, channelId: 1, status: 1 });
meetingSchema.index({ startedAt: -1, status: 1 });
meetingSchema.index({ scheduledAt: 1, reminderSentAt: 1 }); // For querying scheduled meetings

export default mongoose.model<IMeeting>('Meeting', meetingSchema);