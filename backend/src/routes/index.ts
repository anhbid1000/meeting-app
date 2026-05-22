import { Router } from "express";
import workspaceRoutes from "./Workspace.route";
import workspaceInviteRoutes from "./workspaceInvite.routes";
import channelMemberRoutes from "./channelMember.routes";
import channelJoinRequestRoutes from "./channelJoinRequest.routes";
import messageRoutes from "./message.routes";
import notificationRoutes from "./notification.routes";
import threadReplyRoutes from "./threadReply.routes";
import fileRoutes from "./file.routes";

const router = Router();

// Workspace endpoints
router.use("/workspaces", workspaceRoutes);

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
