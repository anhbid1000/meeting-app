import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateWorkspaceInviteDTO, ReviewWorkspaceInviteDTO } from '../dtos/WorkspaceInvite.dto';
import * as workspaceInviteController from '../controllers/workspaceInvite.controller';

const router = Router();

// POST /api/v1/workspaces/:workspaceId/invites
router.post(
  '/workspaces/:workspaceId/invites',
  auth,
  validate(CreateWorkspaceInviteDTO),
  workspaceInviteController.createInvite
);

// GET /api/v1/workspace-invites/:code
router.get(
  '/workspace-invites/:code',
  auth,
  workspaceInviteController.getInviteByCode
);

// POST /api/v1/workspace-invites/:code/accept
router.post(
  '/workspace-invites/:code/accept',
  auth,
  workspaceInviteController.acceptInvite
);

export default router;