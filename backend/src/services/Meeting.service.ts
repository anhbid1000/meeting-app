
import { Types } from "mongoose";
import Workspace from "../models/Workspace.model";
import Meeting from "../models/Meeting.model";
import Channel from "../models/Channel.model";

export const listMeetingsHistory = async (userId: string, options?: {
    status?: 'live' | 'working' | 'ended';
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
    sortBy?: 'startedAt' | 'scheduledAt' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}) => {
    try {
        if (!userId) {
            throw new Error("UserID is empty!");
        }

        // Set default options
        const {
            status,
            fromDate,
            toDate,
            page = 1,
            limit = 20,
            sortBy = 'startedAt',
            sortOrder = 'desc'
        } = options || {};

        // 1. Lấy danh sách workspace và channel của user
        const userWorkspaces = await Workspace.find({
            'members.userId': new Types.ObjectId(userId)
        }).select('_id').lean();

        const userChannels = await Channel.find({
            members: new Types.ObjectId(userId)
        }).select('_id').lean();

        const workspaceIds = userWorkspaces.map(w => w._id);
        const channelIds = userChannels.map(c => c._id);

        // 2. Build query
        const query: any = {
            $or: [
                { hostId: new Types.ObjectId(userId) },
                { 'participants.userId': new Types.ObjectId(userId) },
                { workspaceId: { $in: workspaceIds } },
                { channelId: { $in: channelIds } }
            ]
        };

        if (status) {
            query.status = status;
        }

        if (fromDate || toDate) {
            query.startedAt = {};
            if (fromDate) query.startedAt.$gte = fromDate;
            if (toDate) query.startedAt.$lte = toDate;
        }

        // 3. Pagination và sort
        const skip = (page - 1) * limit;
        const sort: any = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // 4. Query meetings
        const [meetings, total] = await Promise.all([
            Meeting.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('workspaceId', 'name avatar')
                .populate('channelId', 'name slug')
                .populate('hostId', 'name email')
                .populate('participants.userId', 'name email')
                .lean(),
            Meeting.countDocuments(query)
        ]);

        // 5. Enrich data
        const enrichedMeetings = meetings.map(meeting => {
            const isHost = String(meeting.hostId._id || meeting.hostId) === userId;
            const participantInfo = meeting.participants?.find(
                (p: any) => String(p.userId._id || p.userId) === userId
            );

            return {
                ...meeting,
                userRole: isHost ? 'host' : 'participant',
                joinedAt: participantInfo?.joinedAt,
                leftAt: participantInfo?.leftAt
            };
        });

        return {
            success: true,
            data: enrichedMeetings,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message,
            data: []
        };
    }
};