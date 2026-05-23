import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import workspaceRoutes from "./Workspace.route";
import workspaceInviteRoutes from "./workspaceInvite.routes";
import categoryRoutes from "./Category.route";
import channelRoutes from "./Channel.route";
import fileAssetRoutes from "./FileAsset.route";
import meetingRoutes from "./Meeting.route";
import meetingGlobalRoutes from "./MeetingGlobal.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/workspaces/:workspaceId/channels", channelRoutes);
router.use("/workspaces/:workspaceId/files", fileAssetRoutes);
router.use("/workspaces/:workspaceId/channels/:channelId/meetings", meetingRoutes);
router.use("/meetings", meetingGlobalRoutes);
router.use("/categories", categoryRoutes);
// Cac endpoint moi workspace:
// - /api/v1/workspaces/:workspaceId/invites
// - /api/v1/workspace-invites/:code
router.use("/", workspaceInviteRoutes);

export default router;
