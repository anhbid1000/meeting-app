import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import Meeting from "../models/Meeting.model";
import Workspace from "../models/Workspace.model";
import Channel from "../models/Channel.model";
import { AppError } from "../utils/AppError";
import { createLiveKitToken, getRoomParticipantCount } from "../services/LiveKit.service";

const normalizeParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const createMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = normalizeParam(req.user?.id as string | string[] | undefined);
    if (!userId) {
      throw new AppError("Cần đăng nhập", 401, "AUTH_REQUIRED");
    }

    const workspaceId = normalizeParam(req.params.workspaceId as string | string[] | undefined);
    const channelId = normalizeParam(req.params.channelId as string | string[] | undefined);
    const { title, description, scheduledAt } = req.body;

    if (!workspaceId || !channelId) {
      throw new AppError("Thiếu workspaceId hoặc channelId", 400, "VALIDATION_ERROR");
    }

    if (!title || !title.trim()) {
      throw new AppError("Tiêu đề cuộc họp là bắt buộc", 400, "VALIDATION_ERROR");
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new AppError("Không tìm thấy workspace", 404, "WORKSPACE_NOT_FOUND");
    }

    const channel = await Channel.findOne({
      _id: new Types.ObjectId(channelId),
      workspaceId: new Types.ObjectId(workspaceId),
    });
    if (!channel) {
      throw new AppError("Không tìm thấy channel", 404, "CHANNEL_NOT_FOUND");
    }

    const isWorkspaceAdmin = req.workspace?.members?.find(
      (m: any) => String(m.userId) === userId && (m.role === "admin" || m.role === "owner")
    );
    const isChannelMember = channel.members?.some((memberId: any) => String(memberId) === userId);

    if (!isWorkspaceAdmin && !isChannelMember) {
      throw new AppError("Bạn không thuộc channel này", 403, "CHANNEL_FORBIDDEN");
    }

    // livekitRoomName đóng vai trò meetingId public để join
    const livekitRoomName = `${workspaceId}-${channelId}-${new Types.ObjectId()}`;

    const parsedScheduledAt = scheduledAt ? new Date(scheduledAt) : undefined;

    const meeting = await Meeting.create({
      title,
      description,
      scheduledAt: parsedScheduledAt,
      workspaceId: new Types.ObjectId(workspaceId),
      channelId: new Types.ObjectId(channelId),
      hostId: new Types.ObjectId(userId),
      livekitRoomName,
      status: parsedScheduledAt && parsedScheduledAt > new Date() ? "live" : "working",
      startedAt: parsedScheduledAt && parsedScheduledAt > new Date() ? parsedScheduledAt : new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Tạo cuộc họp thành công",
      data: meeting,
    });
  } catch (error) {
    next(error);
  }
};

export const joinMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = normalizeParam(req.user?.id as string | string[] | undefined);
    if (!userId) {
      throw new AppError("Cần đăng nhập", 401, "AUTH_REQUIRED");
    }

    const meetingIdParam = normalizeParam(req.params.meetingId as string | string[] | undefined);
    if (!meetingIdParam) {
      throw new AppError("Thiếu meetingId", 400, "VALIDATION_ERROR");
    }

    const isMongoId = Types.ObjectId.isValid(meetingIdParam);
    const meeting = await Meeting.findOne(
      isMongoId
        ? { $or: [{ _id: new Types.ObjectId(meetingIdParam) }, { livekitRoomName: meetingIdParam }] }
        : { livekitRoomName: meetingIdParam }
    )
      .populate("workspaceId")
      .lean();

    if (!meeting) {
      throw new AppError("Không tìm thấy cuộc họp", 404, "MEETING_NOT_FOUND");
    }

    if (meeting.status === "ended") {
      throw new AppError("Cuộc họp đã kết thúc", 400, "MEETING_ENDED");
    }

    const workspace = await Workspace.findById(meeting.workspaceId);
    if (!workspace) {
      throw new AppError("Không tìm thấy workspace", 404, "WORKSPACE_NOT_FOUND");
    }

    const isWorkspaceMember = workspace.members?.some((m: any) => String(m.userId) === userId);

    let isChannelMember = false;
    if (meeting.channelId) {
      const channel = await Channel.findById(meeting.channelId);
      if (channel) {
        isChannelMember = channel.members?.some((memberId: any) => String(memberId) === userId);
      }
    } else {
      isChannelMember = true;
    }

    if (!isWorkspaceAdmin(req.user, workspace) && (!isWorkspaceMember || !isChannelMember)) {
      throw new AppError("Bạn không có quyền tham gia cuộc họp của channel/workspace này", 403, "FORBIDDEN_ACCESS");
    }

    await Meeting.updateOne({ _id: meeting._id, status: { $ne: "ended" } }, { $set: { status: "working" } });

    const token = await createLiveKitToken(meeting.livekitRoomName, (req.user as any)?.name || "Member", userId);

    res.status(200).json({
      success: true,
      data: {
        token,
        livekitUrl: process.env.LIVEKIT_URL,
        meeting,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listMyMeetingsToday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = normalizeParam(req.user?.id as string | string[] | undefined);
    if (!userId) {
      throw new AppError("Cần đăng nhập", 401, "AUTH_REQUIRED");
    }

    const workspaces = await Workspace.find({ "members.userId": new Types.ObjectId(userId) })
      .select("_id name")
      .lean();
    const workspaceIds = workspaces.map((w: any) => w._id);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const meetings = await Meeting.find({
      workspaceId: { $in: workspaceIds },
      startedAt: { $gte: start, $lte: end },
    })
      .sort({ startedAt: -1 })
      .populate("workspaceId", "name")
      .populate("channelId", "name slug")
      .populate("hostId", "name")
      .lean();

    res.status(200).json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    next(error);
  }
};

export const endMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = normalizeParam(req.user?.id as string | string[] | undefined);
    if (!userId) {
      throw new AppError("Cần đăng nhập", 401, "AUTH_REQUIRED");
    }

    const meetingIdParam = normalizeParam(req.params.meetingId as string | string[] | undefined);
    if (!meetingIdParam) {
      throw new AppError("Thiếu meetingId", 400, "VALIDATION_ERROR");
    }

    const isMongoId = Types.ObjectId.isValid(meetingIdParam);
    const meeting = await Meeting.findOne(
      isMongoId
        ? { $or: [{ _id: new Types.ObjectId(meetingIdParam) }, { livekitRoomName: meetingIdParam }] }
        : { livekitRoomName: meetingIdParam }
    );

    if (!meeting) {
      throw new AppError("Không tìm thấy cuộc họp", 404, "MEETING_NOT_FOUND");
    }

    if (String(meeting.hostId) !== userId && req.user?.role !== "admin") {
      throw new AppError("Chỉ có chủ phòng mới có quyền kết thúc cuộc họp", 403, "NOT_MEETING_HOST");
    }

    meeting.status = "ended";
    meeting.endedAt = new Date();
    await meeting.save();

    res.status(200).json({
      success: true,
      message: "Cuộc họp đã kết thúc",
      data: meeting,
    });
  } catch (error) {
    next(error);
  }
};

function isWorkspaceAdmin(user: any, workspace: any) {
  if (user?.role === "admin") return true;
  const m = workspace?.members?.find((member: any) => String(member.userId) === user?.id);
  return m?.role === "admin" || m?.role === "owner";
}
