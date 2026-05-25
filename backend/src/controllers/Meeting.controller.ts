import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import Meeting from "../models/Meeting.model";
import Workspace from "../models/Workspace.model";
import Channel from "../models/Channel.model";
import ChannelMember from "../models/ChannelMember.model";
import Message from "../models/Message.model";
import { AppError } from "../utils/AppError";
import * as meetingService from "../services/Meeting.service";
import { MessageService } from "../services/Message.service";
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

    // Tạo meeting với participants bao gồm host
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
      participants: [{
        userId: new Types.ObjectId(userId),
        joinedAt: new Date(),
      }]
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

    // Kiểm tra quyền (bao gồm cả host)
    const isHost = String(meeting.hostId) === userId;
    const canJoin = isWorkspaceAdmin(req.user, workspace) ||
      (isWorkspaceMember && isChannelMember) ||
      isHost;

    if (!canJoin) {
      throw new AppError("Bạn không có quyền tham gia cuộc họp này", 403, "FORBIDDEN_ACCESS");
    }

    // Cập nhật trạng thái meeting nếu đang ở trạng thái live (scheduled)
    await Meeting.updateOne(
      { _id: meeting._id, status: { $ne: "ended" } },
      { $set: { status: "working" } }
    );

    // Thêm user vào participants
    const existingParticipant = await Meeting.findOne({
      _id: meeting._id,
      'participants.userId': new Types.ObjectId(userId)
    });

    if (!existingParticipant) {
      await Meeting.updateOne(
        { _id: meeting._id },
        {
          $push: {
            participants: {
              userId: new Types.ObjectId(userId),
              joinedAt: new Date(),
            }
          }
        }
      );
    } else {
      // Nếu đã có nhưng chưa có leftAt (đã rời đi trước đó), cập nhật lại joinedAt
      await Meeting.updateOne(
        {
          _id: meeting._id,
          'participants.userId': new Types.ObjectId(userId),
          'participants.leftAt': { $exists: true }
        },
        {
          $set: {
            'participants.$.joinedAt': new Date(),
            'participants.$.leftAt': null
          }
        }
      );
    }

    // Tạo token LiveKit
    const token = await createLiveKitToken(
      meeting.livekitRoomName,
      (req.user as any)?.name || "Member",
      userId
    );

    // Lấy lại thông tin meeting đã cập nhật (không lean để có participants)
    const updatedMeeting = await Meeting.findById(meeting._id)
      .populate("workspaceId")
      .populate("participants.userId", "name email")
      .lean();

    res.status(200).json({
      success: true,
      data: {
        token,
        livekitUrl: process.env.LIVEKIT_URL,
        meeting: updatedMeeting,
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

export const listMyMeetingsHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = normalizeParam(req.user?.id as string | string[] | undefined);

    if (!userId) {
      throw new AppError("Need to be signed in", 401, "AUTH_REQUIRED");
    }

    const meetingHistory = await meetingService.listMeetingsHistory(userId);

    res.status(200).json({
      success: true,
      message: "Lay du lieu history meeting thanh cong",
      data: meetingHistory
    }
    );
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

    if (meeting.status === "ended") {
      return res.status(200).json({
        success: true,
        message: "Cuộc họp đã kết thúc trước đó",
        data: meeting,
      });
    }

    if (String(meeting.hostId) !== userId && req.user?.role !== "admin") {
      throw new AppError("Chỉ có chủ phòng mới có quyền kết thúc cuộc họp", 403, "NOT_MEETING_HOST");
    }

    const endedAt = new Date();
    const startedAt = meeting.startedAt || (meeting as any).createdAt || endedAt;
    const durationMinutes = Math.max(
      0,
      Math.ceil((endedAt.getTime() - new Date(startedAt).getTime()) / (1000 * 60))
    );

    // Snapshot chat messages during this meeting window
    const messages = await Message.find({
      channelId: meeting.channelId,
      createdAt: { $gte: startedAt, $lte: endedAt },
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: 1 })
      .select("userId content createdAt")
      .lean();

    const chatLog = messages.map((msg: any) => ({
      userId: msg.userId,
      content: msg.content,
      timestamp: msg.createdAt,
    }));

    await Meeting.updateOne(
      { _id: meeting._id },
      {
        $set: {
          status: "ended",
          endedAt,
          durationMinutes,
          chatLog,
          // mark remaining participants as left
          "participants.$[p].leftAt": endedAt,
        },
      },
      {
        arrayFilters: [{ "p.leftAt": { $exists: false } }],
      }
    );

    // Snapshot chatLog can potentially be empty if no messages were sent in channel during meeting
    // We should also ensure internalGenerateSummary gets the latest notes which are already in DB.

    // Trigger AI summary in background - fetch and process immediately
    void (async () => {
      try {
        console.log(`[Meeting] Auto-generating summary for meeting: ${meeting._id}`);
        const result = await internalGenerateSummary(String(meeting._id));
        if (result) {
          console.log(`[Meeting] Summary generated successfully for: ${meeting._id}`);
        } else {
          console.log(`[Meeting] No content to summarize for: ${meeting._id}`);
        }
      } catch (e) {
        console.error(`[Meeting] Failed to auto-generate summary: ${e}`);
      }
    })();

    const updated = await Meeting.findById(meeting._id).lean();

    // Optional: send a system message to channel
    try {
      await MessageService.sendMessage({
        channelId: String(meeting.channelId),
        userId,
        content: `Cuộc họp "${meeting.title}" đã kết thúc. Thời lượng: ${durationMinutes} phút.`,
        type: "meeting",
      });
    } catch (e) {
      console.error("send meeting ended message failed", e);
    }

    res.status(200).json({
      success: true,
      message: "Cuộc họp đã kết thúc",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};


const findMeetingByParam = (meetingIdParam: string) => {
  const isMongoId = Types.ObjectId.isValid(meetingIdParam);
  return Meeting.findOne(
    isMongoId
      ? { $or: [{ _id: new Types.ObjectId(meetingIdParam) }, { livekitRoomName: meetingIdParam }] }
      : { livekitRoomName: meetingIdParam }
  );
};

const buildMeetingSummaryWithLlm = async (input: string) => {
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || "gemini-3-pro";

  if (!apiKey) {
    throw new AppError("Chưa cấu hình LLM_API_KEY", 500, "LLM_CONFIG_MISSING");
  }

  // URL mẫu theo Gemini: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;

  const systemInstruction = [
    "Bạn là trợ lý tóm tắt cuộc họp.",
    "Hãy trả về DUY NHẤT một JSON hợp lệ (không markdown, không giải thích thêm).",
    "Ngôn ngữ: tiếng Việt.",
    "Schema bắt buộc:",
    "{",
    "  \"title\": string,",
    "  \"summary\": string,",
    "  \"key_points\": string[],",
    "  \"decisions\": string[],",
    "  \"action_items\": Array<{ \"task\": string, \"owner\": string | null, \"due\": string | null }>,",
    "  \"risks_and_questions\": string[],",
    "  \"next_meeting\": { \"proposed_time\": string | null, \"agenda\": string[] }",
    "}",
    "Quy tắc:",
    "- Nếu không có dữ liệu cho field nào, dùng mảng rỗng [] hoặc null phù hợp.",
    "- owner: cố gắng suy luận từ nội dung (tên người nói/note), nếu không rõ để null.",
    "- due: định dạng ISO 8601 (YYYY-MM-DD) nếu suy ra được, không thì null.",
    "- Không được bịa thông tin; nếu không chắc thì để null/[] hoặc mô tả ngắn trong risks_and_questions.",
  ].join("\n");

  const prompt = `${systemInstruction}\n\nNỘI DUNG CUỘC HỌP CẦN TÓM TẮT:\n${input}`;

  const response = await fetch(`${apiUrl}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Gemini API Error:", errorBody);
    throw new AppError(`Gọi API Gemini thất bại: ${response.status}`, 502, "LLM_REQUEST_FAILED");
  }

  const data = await response.json();
  // Response của Gemini: candidates[0].content.parts[0].text
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text.trim();
};

const internalGenerateSummary = async (meetingId: string) => {
  try {
    const meeting = await Meeting.findById(meetingId)
      .populate("chatLog.userId", "name email")
      .populate("notes.userId", "name email");

    if (!meeting) return null;

    const notes = (meeting.notes || []).map((n: any) => {
      const name = n.userId?.name || n.userId?.email || "Người dùng";
      return `[NOTE][${new Date(n.timestamp).toLocaleString("vi-VN")}] ${name}: ${n.content}`;
    });
    const chats = (meeting.chatLog || []).map((c: any) => {
      const name = c.userId?.name || c.userId?.email || "Người dùng";
      return `[CHAT][${new Date(c.timestamp).toLocaleString("vi-VN")}] ${name}: ${c.content}`;
    });

    const source = [
      `Tiêu đề cuộc họp: ${meeting.title}`,
      "",
      "Ghi chú cuộc họp:",
      ...notes,
      "",
      "Tin nhắn chat cuộc họp:",
      ...chats,
    ].join("\n");

    if (notes.length === 0 && chats.length === 0) return null;

    const summary = await buildMeetingSummaryWithLlm(source);
    meeting.transcript = source;
    meeting.summary = summary;
    await meeting.save();
    return { summary, transcript: source };
  } catch (err) {
    console.error("Background summary generation failed:", err);
    return null;
  }
};

export const addChatLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = normalizeParam(req.user?.id as string | string[] | undefined);
    if (!userId) {
      throw new AppError("Cần đăng nhập", 401, "AUTH_REQUIRED");
    }

    const meetingIdParam = normalizeParam(req.params.meetingId as string | string[] | undefined);
    const { content, timestamp } = req.body;

    if (!meetingIdParam || !content) {
      throw new AppError("Thiếu dữ liệu", 400, "VALIDATION_ERROR");
    }

    await Meeting.updateOne(
      {
        $or: [
          { _id: new Types.ObjectId(meetingIdParam) },
          { livekitRoomName: meetingIdParam }
        ]
      },
      {
        $push: {
          chatLog: {
            userId: new Types.ObjectId(userId),
            content,
            timestamp: new Date(timestamp)
          }
        }
      }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};




export const addMeetingNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = normalizeParam(req.user?.id as string | string[] | undefined);
    if (!userId) {
      throw new AppError("Cần đăng nhập", 401, "AUTH_REQUIRED");
    }

    const meetingIdParam = normalizeParam(req.params.meetingId as string | string[] | undefined);
    const { content, timestamp } = req.body;

    if (!meetingIdParam || !content || !String(content).trim()) {
      throw new AppError("Thiếu dữ liệu note", 400, "VALIDATION_ERROR");
    }

    const note = {
      userId: new Types.ObjectId(userId),
      content: String(content).trim(),
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    };

    await Meeting.updateOne(
      Types.ObjectId.isValid(meetingIdParam)
        ? { $or: [{ _id: new Types.ObjectId(meetingIdParam) }, { livekitRoomName: meetingIdParam }] }
        : { livekitRoomName: meetingIdParam },
      { $push: { notes: note } }
    );

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

export const generateMeetingSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = normalizeParam(req.user?.id as string | string[] | undefined);
    if (!userId) {
      throw new AppError("Cần đăng nhập", 401, "AUTH_REQUIRED");
    }

    const meetingIdParam = normalizeParam(req.params.meetingId as string | string[] | undefined);
    if (!meetingIdParam) {
      throw new AppError("Thiếu meetingId", 400, "VALIDATION_ERROR");
    }

    const meeting = await findMeetingByParam(meetingIdParam);
    if (!meeting) {
      throw new AppError("Không tìm thấy cuộc họp", 404, "MEETING_NOT_FOUND");
    }

    const result = await internalGenerateSummary(String(meeting._id));
    if (!result) {
      throw new AppError("Chưa có note hoặc chat để tóm tắt", 400, "SUMMARY_SOURCE_EMPTY");
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const leaveMeeting = async (req: Request, res: Response, next: NextFunction) => {
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

    if (meeting.status === "ended") {
      return res.status(200).json({
        success: true,
        message: "Cuộc họp đã kết thúc",
        data: meeting,
      });
    }

    const participant = meeting.participants?.find((p) => String(p.userId) === userId);

    if (!participant) {
      throw new AppError("Bạn chưa tham gia cuộc họp này", 400, "PARTICIPANT_NOT_FOUND");
    }

    if (participant.leftAt) {
      return res.status(200).json({
        success: true,
        message: "Bạn đã rời cuộc họp trước đó",
        data: meeting,
      });
    }

    const leftAt = new Date();

    await Meeting.updateOne(
      { _id: meeting._id },
      {
        $set: {
          "participants.$[p].leftAt": leftAt,
        },
      },
      {
        arrayFilters: [
          {
            "p.userId": new Types.ObjectId(userId),
            "p.leftAt": { $exists: false },
          },
        ],
      }
    );

    const updatedMeeting = await Meeting.findById(meeting._id)
      .populate("workspaceId", "name")
      .populate("channelId", "name slug")
      .populate("hostId", "name email")
      .populate("participants.userId", "name email")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Rời cuộc họp thành công",
      data: updatedMeeting,
    });
  } catch (error) {
    next(error);
  }
};

export const getMeetingById = async (req: Request, res: Response, next: NextFunction) => {
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
      .populate("workspaceId", "name avatar")
      .populate("channelId", "name slug")
      .populate("hostId", "name email avatar")
      .populate("participants.userId", "name email avatar")
      .populate("chatLog.userId", "name email avatar")
      .populate("notes.userId", "name email avatar")
      .lean();

    if (!meeting) {
      throw new AppError("Không tìm thấy cuộc họp", 404, "MEETING_NOT_FOUND");
    }
    const channelId =
      typeof meeting.channelId === "object" && meeting.channelId !== null && "_id" in meeting.channelId
        ? String((meeting.channelId as any)._id)
        : meeting.channelId
          ? String(meeting.channelId)
          : null;

    let isChannelMember = false;

    if (channelId && Types.ObjectId.isValid(channelId)) {
      const channel = await Channel.findById(channelId)
        .select("members")
        .lean();

      isChannelMember = Boolean(
        channel?.members?.some((memberId: any) => String(memberId) === userId)
      );
    } else {
      isChannelMember = true;
    }

    if (!isChannelMember) {
      throw new AppError("Bạn không có quyền xem chi tiết cuộc họp này", 403, "FORBIDDEN");
    }

    res.status(200).json({
      success: true,
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
