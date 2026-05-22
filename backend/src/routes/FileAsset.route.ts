import { Router } from 'express';
import * as fileAssetController from '../controllers/FileAsset.controller';
import { auth } from '../middlewares/auth.middleware';
import { uploadSingleFile } from '../middlewares/upload.middleware';

const router = Router({ mergeParams: true });

router.get('/', auth, fileAssetController.listWorkspaceFiles);
router.get('/:fileId', auth, fileAssetController.getWorkspaceFile);
router.get('/:fileId/download', auth, fileAssetController.downloadFile);
router.delete('/:fileId', auth, fileAssetController.deleteWorkspaceFile);
router.post('/upload', auth, uploadSingleFile, fileAssetController.uploadWorkspaceFile);

export default router;
