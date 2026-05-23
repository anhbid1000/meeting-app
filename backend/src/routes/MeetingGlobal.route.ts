import { Router } from "express";
import * as meetingController from "../controllers/Meeting.controller";
import { auth } from "../middlewares/auth.middleware";

const router = Router();

// Mounted at /meetings
router.get("/my/today", auth, meetingController.listMyMeetingsToday);
router.get("/:meetingId/join", auth, meetingController.joinMeeting);
router.patch("/:meetingId/end", auth, meetingController.endMeeting);

export default router;
