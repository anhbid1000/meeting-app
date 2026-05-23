import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../services/Notification.service";

const parseParam = (param: string | string[]): string =>
  Array.isArray(param) ? param[0] : param;

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const pageStr = Array.isArray(req.query.page)
      ? req.query.page[0]
      : req.query.page;
    const limitStr = Array.isArray(req.query.limit)
      ? req.query.limit[0]
      : req.query.limit;
    const unreadOnlyRaw = Array.isArray(req.query.unreadOnly)
      ? req.query.unreadOnly[0]
      : req.query.unreadOnly;

    const result = await NotificationService.getNotifications({
      userId,
      page: pageStr ? Number(pageStr) : 1,
      limit: limitStr ? Number(limitStr) : 20,
      unreadOnly:
        String(unreadOnlyRaw || "").toLowerCase() === "true" ||
        String(unreadOnlyRaw || "") === "1",
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const result = await NotificationService.getUnreadCount(userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const notificationId = parseParam(req.params.notificationId);
    const result = await NotificationService.markAsRead(notificationId, userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const result = await NotificationService.markAllAsRead(userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const notificationId = parseParam(req.params.notificationId);
    const result = await NotificationService.deleteNotification(
      notificationId,
      userId,
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
