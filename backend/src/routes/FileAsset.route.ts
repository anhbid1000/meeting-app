import { Router } from 'express';
import * as fileAssetController from '../controllers/FileAsset.controller';
import { auth } from '../middlewares/auth.middleware';
import { uploadSingleFile } from '../middlewares/upload.middleware';

const router = Router({ mergeParams: true });

router.get('/', auth, fileAssetController.listWorkspaceFiles);
// router.get('/:fileId/download', auth, fileAssetController.downloadWorkspaceFile);
router.get('/:fileId', auth, fileAssetController.getWorkspaceFile);
// router.delete('/:fileId', auth, fileAssetController.deleteWorkspaceFile);
router.post('/upload', auth, uploadSingleFile, fileAssetController.uploadWorkspaceFile);

router.get('/channel/:channelId/all', auth, fileAssetController.getChannelFiles);
router.get('/channel/:channelId/media', auth, fileAssetController.getChannelMedia);
router.get('/channel/:channelId/links', auth, fileAssetController.getChannelLinks);

export default router;
