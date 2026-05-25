import { Router } from "express";
import * as meetingController from "../controllers/Meeting.controller";
import { auth } from "../middlewares/auth.middleware";

const router = Router();

// Mounted at /meetings
router.get("/my/today", auth, meetingController.listMyMeetingsToday);
router.get("/my/history", auth, meetingController.listMyMeetingsHistory);
router.get("/:meetingId", auth, meetingController.getMeetingById);
router.get("/:meetingId/join", auth, meetingController.joinMeeting);
router.patch("/:meetingId/end", auth, meetingController.endMeeting);
router.patch("/:meetingId/leave", auth, meetingController.leaveMeeting);
router.post("/:meetingId/chat-log", auth, meetingController.addChatLog);
router.post("/:meetingId/notes", auth, meetingController.addMeetingNote);
router.post("/:meetingId/summary", auth, meetingController.generateMeetingSummary);

export default router;
