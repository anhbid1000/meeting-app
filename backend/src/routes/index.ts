import { Router } from "express";
import workspaceRoutes from "./Workspace.route";
import workspaceInviteRoutes from "./workspaceInvite.routes";
import channelMemberRoutes from "./channelMember.routes";

const router = Router();

// Workspace endpoints live under /api/v1/workspaces
// Channel endpoints are nested under workspace router:
//   /api/v1/workspaces/:workspaceId/channels/...
router.use("/workspaces", workspaceRoutes);

// Channel-member actions live under /api/v1/channels/... (clean prefix, not duplicated)
router.use("/channels", channelMemberRoutes);

// Invite endpoints live at:
// - /api/v1/workspaces/:workspaceId/invites
// - /api/v1/workspace-invites/:code
router.use("/", workspaceInviteRoutes);

export default router;
