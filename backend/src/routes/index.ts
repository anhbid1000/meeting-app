import { Router } from 'express';
import workspaceRoutes from './Workspace.route';
import workspaceInviteRoutes from './workspaceInvite.routes';

const router = Router();

router.use('/workspaces', workspaceRoutes);
// Invite endpoints live at:
// - /api/v1/workspaces/:workspaceId/invites
// - /api/v1/workspace-invites/:code
router.use('/', workspaceInviteRoutes);

export default router;