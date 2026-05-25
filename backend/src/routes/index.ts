import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import workspaceRoutes from "./Workspace.route";
import workspaceInviteRoutes from "./workspaceInvite.routes";
import categoryRoutes from "./Category.route";
import channelRoutes from "./channel.routes";
import fileAssetRoutes from "./FileAsset.route";
import meetingRoutes from "./Meeting.route";
import meetingGlobalRoutes from "./MeetingGlobal.route";
import channelJoinRequestRoutes from "./channelJoinRequest.routes";
import messageRoutes from "./message.routes";
import notificationRoutes from "./notification.routes";
import threadReplyRoutes from "./threadReply.routes";
import fileRoutes from "./file.routes";
import channelMemberRoutes from "./channelMember.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/workspaces/:workspaceId/channels", channelRoutes);
router.use("/workspaces/:workspaceId/files", fileAssetRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/workspaces/:workspaceId/channels/:channelId/meetings", meetingRoutes);
router.use("/meetings", meetingGlobalRoutes);
router.use("/categories", categoryRoutes);
// Cac endpoint moi workspace:
// - /api/v1/workspaces/:workspaceId/invites
// - /api/v1/workspace-invites/:code
router.use("/", workspaceInviteRoutes);

// Channel join requests
router.use("/channels", channelJoinRequestRoutes);

// Channel-member actions
router.use("/channels", channelMemberRoutes);

// Messages endpoints
router.use("/", messageRoutes);

// Thread replies endpoints
router.use("/", threadReplyRoutes);

// File sharing endpoints
router.use("/", fileRoutes);

// Notification endpoints
router.use("/notifications", notificationRoutes);

// Invite endpoints
router.use("/", workspaceInviteRoutes);

export default router;
