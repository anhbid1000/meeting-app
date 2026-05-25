import { Router } from 'express';
import * as workspaceController from '../controllers/Workspace.controller';
import { auth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateWorkspaceDTO } from '../dtos/Workspace.dto';
import {
  requireWorkspaceAdminOrOwner,
  requireWorkspaceAdminOrSelf,
} from '../middlewares/workspaceAuth.middleware';

const router = Router();

router.get('/me', auth, workspaceController.getMyWorkspaces);
router.get('/:workspaceId', auth, workspaceController.getWorkspaceById);
router.post(
  "/",
  auth, // 1. Check đăng nhập
  validate(CreateWorkspaceDTO), // 2. Check dữ liệu gửi lên
  workspaceController.handleCreateWorkspace, // 3. Xử lý logic
);

router.post(
  '/:workspaceId/members',
  auth,
  requireWorkspaceAdminOrOwner,
  workspaceController.addWorkspaceMember
);
router.post(
  '/:workspaceId/members/:memberId/approve',
  auth,
  requireWorkspaceAdminOrOwner,
  workspaceController.approveWorkspaceMember
);
router.patch(
  '/:workspaceId/members/roles',
  auth,
  workspaceController.updateWorkspaceMemberRoles
);
router.delete(
  '/:workspaceId/members/:memberId',
  auth,
  requireWorkspaceAdminOrSelf,
  workspaceController.removeWorkspaceMember
);
router.delete('/:workspaceId', auth, workspaceController.deleteWorkspace);

export default router;
