import { Router } from "express";
import * as channelMemberController from "../controllers/ChannelMember.controller";
import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { requireChannelMember } from "../middlewares/permission.middleware";
import { MuteChannelDTO, FavoriteChannelDTO } from "../dtos/Channel.dto";

const router = Router();

router.post("/:channelId/join", auth, channelMemberController.joinChannel);

router.post(
  "/:channelId/leave",
  auth,
  requireChannelMember,
  channelMemberController.leaveChannel,
);

router.get(
  "/:channelId/members",
  auth,
  requireChannelMember,
  channelMemberController.getChannelMembers,
);

router.patch(
  "/:channelId/mute",
  auth,
  requireChannelMember,
  validate(MuteChannelDTO),
  channelMemberController.muteChannel,
);

router.patch(
  "/:channelId/favorite",
  auth,
  requireChannelMember,
  validate(FavoriteChannelDTO),
  channelMemberController.favoriteChannel,
);

export default router;
