import { Router } from "express";
import * as notificationController from "../controllers/Notification.controller";
import { auth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", auth, notificationController.getNotifications);
router.get("/unread-count", auth, notificationController.getUnreadCount);
router.patch("/read-all", auth, notificationController.markAllAsRead);
router.patch("/:notificationId/read", auth, notificationController.markAsRead);
router.delete(
  "/:notificationId",
  auth,
  notificationController.deleteNotification,
);

export default router;
