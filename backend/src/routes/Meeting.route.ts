import { Router } from "express";
import * as meetingController from "../controllers/Meeting.controller";
import { auth } from "../middlewares/auth.middleware";

const router = Router({ mergeParams: true });

// Mounted at /workspaces/:workspaceId/channels/:channelId/meetings
router.post("/", auth, meetingController.createMeeting);

export default router;
