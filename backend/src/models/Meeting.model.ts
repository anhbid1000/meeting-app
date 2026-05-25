import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  workspaceId: Types.ObjectId;
  channelId: Types.ObjectId;
  hostId: Types.ObjectId;
  livekitRoomName: string;
  participants: {
    userId: Types.ObjectId;
    joinedAt: Date;
    leftAt?: Date;
  }[];
  transcript?: string;
  summary?: string;
  chatLog?: {
    userId: Types.ObjectId;
    content: string;
    timestamp: Date;
  }[];
  notes?: {
    userId: Types.ObjectId;
    content: string;
    timestamp: Date;
  }[];
  durationMinutes?: number;
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
  participants: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date }
  }],
  transcript: { type: String, default: "" },
  summary: { type: String, default: "" },
  chatLog: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  notes: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  durationMinutes: { type: Number, default: 0 },
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
