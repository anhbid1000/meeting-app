import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { CreateUploadSignatureDTO } from "../dtos/FileAsset.dto";
import * as fileAssetController from "../controllers/FileAsset.controller";

const router = Router();

router.get("/files/open", fileAssetController.openFileAsset);
router.get("/files/download", fileAssetController.downloadFileAsset);

router.post(
  "/files/upload",
  auth,
  validate(CreateUploadSignatureDTO),
  fileAssetController.createUploadSignature,
);

router.get(
  "/channels/:channelId/files",
  auth,
  fileAssetController.getChannelFiles,
);

router.get(
  "/channels/:channelId/media",
  auth,
  fileAssetController.getChannelMedia,
);

router.get(
  "/channels/:channelId/links",
  auth,
  fileAssetController.getChannelLinks,
);

export default router;
