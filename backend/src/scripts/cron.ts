import cron from "node-cron";
import Meeting from "../models/Meeting.model";
import Workspace from "../models/Workspace.model";
import User from "../models/User.model";
import { sendMeetingReminderEmail } from "../services/mail.service";
import { getRoomParticipantCount } from "../services/LiveKit.service";

export const initCronJobs = () => {
  // Chạy mỗi phút 1 lần: gửi reminder
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const in30Mins = new Date(now.getTime() + 30 * 60000);
      const past30Mins = new Date(now.getTime() - 30 * 60000);

      // 1. Gửi Email Reminder
      // Tìm các meeting có scheduledAt <= now + 30 phút, chưa gửi reminder và chưa bắt đầu (status 'live')
      const meetingsToRemind = await Meeting.find({
        status: "live",
        scheduledAt: { $exists: true, $lte: in30Mins, $gte: now },
        reminderSentAt: { $exists: false }
      }).lean();

      if (meetingsToRemind.length > 0) {
        console.log(`[CronJob] Found ${meetingsToRemind.length} meeting(s) to send reminders`);
        for (const meeting of meetingsToRemind) {
          const workspace = await Workspace.findById(meeting.workspaceId).lean();
          if (!workspace || !workspace.members) continue;

          const users = await User.find({ _id: { $in: workspace.members.map((m: any) => m.userId) } }).select("email name").lean();
          for (const user of users) {
            const meetingUrl = `${process.env.FRONTEND_URL}/meetings?meetingId=${meeting._id}&workspaceId=${meeting.workspaceId}&channelId=${meeting.channelId}`;
            const startTimeStr = new Date(meeting.scheduledAt!).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

            await sendMeetingReminderEmail({
              to: user.email,
              name: user.name,
              meetingTitle: meeting.title,
              startTime: startTimeStr,
              meetingUrl
            }).catch((err: unknown) => console.error(`[CronJob] Failed to send email to ${user.email}`, err));
          }
          await Meeting.findByIdAndUpdate(meeting._id, { reminderSentAt: new Date() });
        }
      }

      // 2. Tự động kết thúc các cuộc họp đã lên lịch nhưng quá 30 phút mà chưa ai vào (vẫn ở status 'live')
      const expiredMeetings = await Meeting.find({
        status: "live",
        scheduledAt: { $exists: true, $lt: past30Mins }
      });

      if (expiredMeetings.length > 0) {
        for (const m of expiredMeetings) {
          await Meeting.findByIdAndUpdate(m._id, { status: "ended", endedAt: now });
          console.log(`[CronJob] Auto-ended expired scheduled meeting: ${m._id}`);
        }
      }

    } catch (error) {
      console.error("[CronJob] Error running meeting cron job:", error);
    }
  });

  // Chạy mỗi phút 1 lần: tự kết thúc meeting khi phòng trống
  cron.schedule("* * * * *", async () => {
    try {
      const workingMeetings = await Meeting.find({ status: "working" }).select("_id livekitRoomName").lean();
      if (workingMeetings.length === 0) return;

      for (const meeting of workingMeetings) {
          try {
            const participantCount = await getRoomParticipantCount(meeting.livekitRoomName);
            if (participantCount === 0) {
              await Meeting.findByIdAndUpdate(meeting._id, {
                status: "ended",
                endedAt: new Date(),
              });
              console.log(`[CronJob] Auto-ended empty meeting: ${meeting._id}`);
            }
          } catch (roomErr: any) {
            // Nếu LiveKit báo 404 (Room không tồn tại) -> nghĩa là room đã đóng/không hoạt động -> End luôn
            if (roomErr?.status === 404 || roomErr?.code === 'not_found') {
              await Meeting.findByIdAndUpdate(meeting._id, {
                status: "ended",
                endedAt: new Date(),
              });
              console.log(`[CronJob] Room not found on LiveKit, auto-ended meeting: ${meeting._id}`);
            } else {
              console.error(`[CronJob] Failed checking participants for meeting ${meeting._id}:`, roomErr);
            }
          }
      }
    } catch (error) {
      console.error("[CronJob] Error running auto-end empty meetings job:", error);
    }
  });

  console.log("🚀 Cron jobs initialized!");
};
