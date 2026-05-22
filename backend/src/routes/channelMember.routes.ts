import { Router } from "express";
import * as channelMemberController from "../controllers/ChannelMember.controller";
import * as channelController from "../controllers/Channel.controller";
import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  requireChannelMember,
  requireFavoriteAccess,
  requireWorkspaceMemberByChannel,
} from "../middlewares/permission.middleware";
import { MuteChannelDTO, FavoriteChannelDTO } from "../dtos/Channel.dto";

const router = Router();

router.get(
  "/:channelId",
  auth,
  requireWorkspaceMemberByChannel,
  channelController.getChannel,
);

router.post(
  "/:channelId/join",
  auth,
  requireWorkspaceMemberByChannel,
  channelMemberController.joinChannel,
);

router.post(
  "/:channelId/leave",
  auth,
  requireChannelMember,
  channelMemberController.leaveChannel,
);

router.delete(
  "/:channelId",
  auth,
  requireWorkspaceMemberByChannel,
  channelController.deleteChannel,
);

router.get(
  "/:channelId/members",
  auth,
  requireChannelMember,
  channelMemberController.getChannelMembers,
);

router.get(
  "/:channelId/invite-candidates",
  auth,
  requireWorkspaceMemberByChannel,
  channelMemberController.getInviteCandidates,
);

router.post(
  "/:channelId/invite",
  auth,
  requireWorkspaceMemberByChannel,
  channelMemberController.inviteMember,
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
  requireFavoriteAccess,
  validate(FavoriteChannelDTO),
  channelMemberController.favoriteChannel,
);

export default router;
