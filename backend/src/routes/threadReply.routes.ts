import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import * as threadReplyController from "../controllers/ThreadReply.controller";

const router = Router();

router.get(
  "/messages/:messageId/replies",
  auth,
  threadReplyController.getThreadReplies,
);
router.post(
  "/messages/:messageId/replies",
  auth,
  threadReplyController.createThreadReply,
);
router.patch("/replies/:replyId", auth, threadReplyController.editThreadReply);
router.delete(
  "/replies/:replyId",
  auth,
  threadReplyController.deleteThreadReply,
);

export default router;
