import { Router } from "express";
import * as channelJoinRequestController from "../controllers/ChannelJoinRequest.controller";
import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { requireWorkspaceMemberByChannel } from "../middlewares/permission.middleware";
import {
  CreateChannelJoinRequestDTO,
  RejectChannelJoinRequestDTO,
} from "../dtos/Channel.dto";

const router = Router();

/**
 * POST /api/v1/channels/:channelId/requests
 * User requests to join a private channel
 */
router.post(
  "/:channelId/requests",
  auth,
  requireWorkspaceMemberByChannel,
  validate(CreateChannelJoinRequestDTO),
  channelJoinRequestController.createRequest,
);

/**
 * GET /api/v1/channels/:channelId/requests?status=pending
 * Get pending requests for a channel (owner/admin only)
 */
router.get(
  "/:channelId/requests",
  auth,
  requireWorkspaceMemberByChannel,
  channelJoinRequestController.getPendingRequests,
);

/**
 * PATCH /api/v1/channels/:channelId/requests/:requestId/approve
 * Approve a join request (owner/admin only)
 */
router.patch(
  "/:channelId/requests/:requestId/approve",
  auth,
  channelJoinRequestController.approveRequest,
);

/**
 * PATCH /api/v1/channels/:channelId/requests/:requestId/reject
 * Reject a join request (owner/admin only)
 */
router.patch(
  "/:channelId/requests/:requestId/reject",
  auth,
  validate(RejectChannelJoinRequestDTO),
  channelJoinRequestController.rejectRequest,
);

/**
 * GET /api/v1/channels/my-pending-requests
 * Get all pending requests in user's inbox
 */
router.get(
  "/my-pending-requests",
  auth,
  channelJoinRequestController.getMyPendingRequests,
);

/**
 * GET /api/v1/channels/my-requests
 * Get latest sent request status per channel for current user.
 */
router.get("/my-requests", auth, channelJoinRequestController.getMyRequests);

export default router;
