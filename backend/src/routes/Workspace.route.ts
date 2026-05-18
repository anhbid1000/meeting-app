import { Router } from 'express';
import * as workspaceController from '../controllers/Workspace.controller';
import { auth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateWorkspaceDTO } from '../dtos/Workspace.dto';


const router = Router();


router.get('/me', auth, workspaceController.getMyWorkspaces);
// router.get('/:workspaceId', auth, workspaceController.getWorkspaceById);
router.post(
  '/',
  auth,                         // 1. Check đăng nhập
  validate(CreateWorkspaceDTO), // 2. Check dữ liệu gửi lên
  workspaceController.handleCreateWorkspace // 3. Xử lý logic
);

router.delete('/:workspaceId', auth, workspaceController.deleteWorkspace);


export default router;