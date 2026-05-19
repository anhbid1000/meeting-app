import mongoose, { Schema, Document, Types } from 'mongoose';

export type MeetingStatus = 'scheduled' | 'live' | 'ended';

export interface IMeeting extends Document {
  channelId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  createdBy: Types.ObjectId;
  title: string;
  status: MeetingStatus;
  startedAt?: Date;
  endedAt?: Date;
  participants: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const meetingSchema = new Schema<IMeeting>(
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended'],
      default: 'scheduled'
    },
    startedAt: Date,
    endedAt: Date,
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  { timestamps: true }
);

meetingSchema.index({ channelId: 1, status: 1, createdAt: -1 });

export default mongoose.model<IMeeting>('Meeting', meetingSchema);
