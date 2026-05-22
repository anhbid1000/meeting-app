import { Request, Response, NextFunction } from "express";
import { MessageService } from "../services/Message.service";

/**
 * Helper to safely parse request params/query values (string | string[]).
 */
const safe = (p: any) => (Array.isArray(p) ? p[0] : p);

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const channelId = safe(req.params.channelId);
    const { content, attachments, mentions, type } = req.body;

    const result = await MessageService.sendMessage({
      channelId,
      userId,
      content,
      attachments,
      mentions,
      type,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const channelId = safe(req.params.channelId);
    const rawLimit = req.query.limit
      ? Number(safe(req.query.limit))
      : undefined;

    const beforeRaw = req.query.before
      ? String(safe(req.query.before))
      : undefined;
    const afterRaw = req.query.after
      ? String(safe(req.query.after))
      : undefined;

    if (beforeRaw && afterRaw) {
      return res.status(422).json({
        message: "Use either before or after cursor, not both",
      });
    }

    const before = beforeRaw ? new Date(beforeRaw) : undefined;
    const after = afterRaw ? new Date(afterRaw) : undefined;

    if (beforeRaw && isNaN(before!.getTime())) {
      return res.status(422).json({ message: "Invalid before timestamp" });
    }

    if (afterRaw && isNaN(after!.getTime())) {
      return res.status(422).json({ message: "Invalid after timestamp" });
    }

    if (
      rawLimit !== undefined &&
      (!Number.isFinite(rawLimit) || rawLimit < 1)
    ) {
      return res
        .status(422)
        .json({ message: "limit must be a positive number" });
    }

    const limit =
      rawLimit === undefined ? undefined : Math.min(Math.floor(rawLimit), 100);

    const result = await MessageService.getMessages({
      channelId,
      userId,
      limit,
      before,
      after,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getPinnedMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const channelId = safe(req.params.channelId);
    const rawLimit = req.query.limit
      ? Number(safe(req.query.limit))
      : undefined;

    const beforeRaw = req.query.before
      ? String(safe(req.query.before))
      : undefined;
    const afterRaw = req.query.after
      ? String(safe(req.query.after))
      : undefined;

    if (beforeRaw && afterRaw) {
      return res.status(422).json({
        message: "Use either before or after cursor, not both",
      });
    }

    const before = beforeRaw ? new Date(beforeRaw) : undefined;
    const after = afterRaw ? new Date(afterRaw) : undefined;

    if (beforeRaw && isNaN(before!.getTime())) {
      return res.status(422).json({ message: "Invalid before timestamp" });
    }

    if (afterRaw && isNaN(after!.getTime())) {
      return res.status(422).json({ message: "Invalid after timestamp" });
    }

    if (
      rawLimit !== undefined &&
      (!Number.isFinite(rawLimit) || rawLimit < 1)
    ) {
      return res
        .status(422)
        .json({ message: "limit must be a positive number" });
    }

    const limit =
      rawLimit === undefined ? undefined : Math.min(Math.floor(rawLimit), 100);

    const result = await MessageService.getPinnedMessages({
      channelId,
      userId,
      limit,
      before,
      after,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const editMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const messageId = safe(req.params.messageId);
    const { content } = req.body;

    const result = await MessageService.editMessage({
      messageId,
      userId,
      content,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const messageId = safe(req.params.messageId);

    const result = await MessageService.deleteMessage({
      messageId,
      userId,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const pinMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const messageId = safe(req.params.messageId);
    const result = await MessageService.pinMessage({ messageId, userId });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const unpinMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const messageId = safe(req.params.messageId);
    const result = await MessageService.unpinMessage({ messageId, userId });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const addReaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const messageId = safe(req.params.messageId);
    const { emoji } = req.body;

    const result = await MessageService.addReaction({
      messageId,
      userId,
      emoji,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const removeReaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const messageId = safe(req.params.messageId);
    const emoji = safe(req.params.emoji);

    const result = await MessageService.removeReaction({
      messageId,
      userId,
      emoji,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
