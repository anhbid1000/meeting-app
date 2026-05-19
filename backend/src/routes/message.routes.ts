import { Router } from 'express';
import * as messageController from '../controllers/Message.controller';
import { auth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateMessageDTO, UpdateMessageDTO } from '../dtos/Message.dto';

const router = Router();

// GET messages for a channel
router.get(
  '/channels/:channelId/messages',
  auth,
  messageController.getMessages
);

// POST a new message to a channel
router.post(
  '/channels/:channelId/messages',
  auth,
  validate(CreateMessageDTO),
  messageController.sendMessage
);

// PATCH edit a message
router.patch(
  '/messages/:messageId',
  auth,
  validate(UpdateMessageDTO),
  messageController.editMessage
);

// DELETE a message
router.delete(
  '/messages/:messageId',
  auth,
  messageController.deleteMessage
);

// Pin a message
router.patch(
  '/messages/:messageId/pin',
  auth,
  messageController.pinMessage
);

// Unpin a message
router.patch(
  '/messages/:messageId/unpin',
  auth,
  messageController.unpinMessage
);

export default router;
