import { Request, Response, NextFunction } from "express";
import { ChannelJoinRequestService } from "../services/ChannelJoinRequest.service";
import { Types } from "mongoose";

const parseParam = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

export const createRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const channelId = parseParam(req.params.channelId);

    if (!Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channelId format" });
    }

    const { message } = req.body;

    const result = await ChannelJoinRequestService.createRequest({
      channelId,
      userId,
      message,
    });

    // If auto-joined, return 200. Otherwise 201 for new request.
    const statusCode = (result as any).autoJoined ? 200 : 201;
    return res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPendingRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const channelId = parseParam(req.params.channelId);
    const pageStr = Array.isArray(req.query.page)
      ? req.query.page[0]
      : req.query.page;
    const limitStr = Array.isArray(req.query.limit)
      ? req.query.limit[0]
      : req.query.limit;

    const result = await ChannelJoinRequestService.getPendingRequests({
      channelId,
      userId,
      page: pageStr ? Number(pageStr) : 1,
      limit: limitStr ? Number(limitStr) : 20,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const approveRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const requestId = parseParam(req.params.requestId);

    const result = await ChannelJoinRequestService.approveRequest({
      requestId,
      userId,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const rejectRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const requestId = parseParam(req.params.requestId);
    const { reason } = req.body;

    const result = await ChannelJoinRequestService.rejectRequest({
      requestId,
      userId,
      reason,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending requests in user's inbox (requests sent to them).
 */
export const getMyPendingRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const result = await ChannelJoinRequestService.getMyPendingRequests(userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get latest requests sent by current user (grouped by channel on service layer).
 */
export const getMyRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const result = await ChannelJoinRequestService.getMyRequests(userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
