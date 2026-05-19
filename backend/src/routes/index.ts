import { Router } from "express";
import workspaceRoutes from "./Workspace.route";
import workspaceInviteRoutes from "./workspaceInvite.routes";
import channelMemberRoutes from "./channelMember.routes";
import channelJoinRequestRoutes from "./channelJoinRequest.routes";
import messageRoutes from "./message.routes";

const router = Router();

// Workspace endpoints
router.use("/workspaces", workspaceRoutes);

// Channel-member actions
router.use("/channels", channelMemberRoutes);

// Channel join requests
router.use("/channels", channelJoinRequestRoutes);

// Messages endpoints
router.use("/", messageRoutes);

// Invite endpoints
router.use("/", workspaceInviteRoutes);

export default router;
