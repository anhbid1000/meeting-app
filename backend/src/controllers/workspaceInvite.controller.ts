import { Request, Response, NextFunction } from 'express';
import * as workspaceInviteService from '../services/workspaceInvite.service';

const firstParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0];
  return value || '';
};

export const createInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = firstParam(req.params.workspaceId);
    const createdBy = (req as any).user.id;
    const { maxUses, expiresInHours } = req.body;

    const result = await workspaceInviteService.createWorkspaceInvite({
      workspaceId,
      createdBy,
      maxUses,
      expiresInHours
    });

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const listPendingInvites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = firstParam(req.params.workspaceId);
    const reviewerId = (req as any).user.id;

    const result = await workspaceInviteService.listPendingWorkspaceInvites({
      workspaceId,
      reviewerId
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getInviteByCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = firstParam(req.params.code);
    const result = await workspaceInviteService.getWorkspaceInviteByCode(code);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const reviewInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inviteId = firstParam(req.params.inviteId);
    const reviewerId = (req as any).user.id;
    const { status, rejectReason } = req.body;

    const result = await workspaceInviteService.reviewWorkspaceInvite({
      inviteId,
      reviewerId,
      status,
      rejectReason
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const acceptInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = firstParam(req.params.code);
    const userId = (req as any).user.id;

    const result = await workspaceInviteService.acceptWorkspaceInvite({
      code,
      userId
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
