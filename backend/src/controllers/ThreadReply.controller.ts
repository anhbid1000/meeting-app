import { Request, Response, NextFunction } from "express";
import { ThreadReplyService } from "../services/ThreadReply.service";

const safe = (p: any) => (Array.isArray(p) ? p[0] : p);

export const getThreadReplies = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const messageId = safe(req.params.messageId);
    const page = req.query.page ? Number(safe(req.query.page)) : 1;
    const limit = req.query.limit ? Number(safe(req.query.limit)) : 100;

    const result = await ThreadReplyService.getThreadReplies({
      messageId,
      userId,
      page,
      limit,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const createThreadReply = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const messageId = safe(req.params.messageId);
    const { content, attachments } = req.body;

    const result = await ThreadReplyService.createThreadReply({
      messageId,
      userId,
      content,
      attachments,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const editThreadReply = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const replyId = safe(req.params.replyId);
    const { content } = req.body;

    const result = await ThreadReplyService.editThreadReply({
      replyId,
      userId,
      content,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteThreadReply = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const replyId = safe(req.params.replyId);

    const result = await ThreadReplyService.deleteThreadReply({
      replyId,
      userId,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
