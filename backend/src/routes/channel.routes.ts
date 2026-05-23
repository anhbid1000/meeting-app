import { Router } from "express";
import * as channelController from "../controllers/Channel.controller";
import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  requireChannelMember,
  requireWorkspaceMember,
} from "../middlewares/permission.middleware";
import { CreateChannelDTO, UpdateChannelDTO } from "../dtos/Channel.dto";

const router = Router({ mergeParams: true });

router.get(
  "/",
  auth,
  requireWorkspaceMember,
  channelController.getChannelDirectory,
);

router.get(
  "/:channelId",
  auth,
  requireWorkspaceMember,
  channelController.getChannel,
);

router.post(
  "/",
  auth,
  requireWorkspaceMember,
  validate(CreateChannelDTO),
  channelController.createChannel,
);

router.patch(
  "/:channelId",
  auth,
  requireChannelMember,
  validate(UpdateChannelDTO),
  channelController.updateChannel,
);

router.delete(
  "/:channelId",
  auth,
  requireChannelMember,
  channelController.deleteChannel,
);

router.patch(
  "/:channelId/archive",
  auth,
  requireChannelMember,
  channelController.archiveChannel,
);

export default router;
