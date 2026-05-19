import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, WorkspaceRole } from '../types';
import Workspace from '../models/Workspace.model';
import ChannelMember from '../models/ChannelMember.model';
import Channel from '../models/Channel.model';

/**
 * Check user is member of workspace.
 * Role inference for current schema:
 * - ownerId === userId -> OWNER
 * - otherwise if in members[] -> MEMBER
 */
export const requireWorkspaceMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const workspaceId = (req.params.workspaceId || req.query.workspaceId) as string;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!workspaceId) {
      return res.status(400).json({ message: 'workspaceId is required' });
    }

    const workspace = await Workspace.findById(workspaceId).select('ownerId members').lean();
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const isOwner = workspace.ownerId.toString() === userId;
    const isMember = workspace.members.some((m: any) => m.toString() === userId);

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Forbidden: you are not a workspace member' });
    }

    req.workspaceMember = {
      workspaceId,
      role: isOwner ? 'OWNER' : 'MEMBER'
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireWorkspaceRole = (...roles: WorkspaceRole[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Ensure workspace context available.
      if (!req.workspaceMember) {
        await new Promise<void>((resolve, reject) => {
          requireWorkspaceMember(req, res, (err?: any) => (err ? reject(err) : resolve()));
        });
      }

      const currentRole = req.workspaceMember?.role;
      if (!currentRole || !roles.includes(currentRole)) {
        return res.status(403).json({
          message: `Forbidden: required role ${roles.join(' or ')}`
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireChannelMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const channelId = req.params.channelId as string;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!channelId) {
      return res.status(400).json({ message: 'channelId is required' });
    }

    // Prefer ChannelMember collection
    const channelMember = await ChannelMember.findOne({ channelId, userId })
      .select('role channelId')
      .lean();

    if (channelMember) {
      req.channelMember = {
        channelId,
        role: channelMember.role
      };
      return next();
    }

    // Fallback to Channel.members[] for backward compatibility
    const channel = await Channel.findById(channelId).select('members').lean();
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const isMember = channel.members.some((m: any) => m.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Forbidden: you are not a channel member' });
    }

    req.channelMember = {
      channelId,
      role: 'member'
    };

    next();
  } catch (error) {
    next(error);
  }
};
