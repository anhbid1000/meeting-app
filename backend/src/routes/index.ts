import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import workspaceRoutes from "./Workspace.route";
import workspaceInviteRoutes from "./workspaceInvite.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/workspaces", workspaceRoutes);
// Cac endpoint moi workspace:
// - /api/v1/workspaces/:workspaceId/invites
// - /api/v1/workspace-invites/:code
router.use("/", workspaceInviteRoutes);

export default router;
