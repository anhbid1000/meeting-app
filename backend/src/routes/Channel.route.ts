import { Router } from 'express';
import * as channelController from '../controllers/Channel.controller';
import { auth } from '../middlewares/auth.middleware';
import { requireWorkspaceAdminOrOwner } from '../middlewares/workspaceAuth.middleware';

const router = Router({ mergeParams: true });

router.post('/', auth, requireWorkspaceAdminOrOwner, channelController.createChannel);

export default router;
