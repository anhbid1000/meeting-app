import { Response, NextFunction } from "express";
import { Types } from "mongoose";
import { AuthenticatedRequest, WorkspaceRole } from "../types";
import Workspace from "../models/Workspace.model";
import ChannelMember from "../models/ChannelMember.model";
import Channel from "../models/Channel.model";

// Require workspace membership by resolving workspace from a channelId param
export const requireWorkspaceMemberByChannel = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const channelId = req.params.channelId as string;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!channelId) {
      return res.status(400).json({ message: "channelId is required" });
    }

    const channel = await Channel.findById(channelId)
      .select("workspaceId")
      .lean();
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const workspace = await Workspace.findById(channel.workspaceId)
      .select("_id ownerId members")
      .lean();
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const resolvedWorkspaceId = workspace._id.toString();

    // attach resolved workspace id for downstream handlers
    req.params.workspaceId = resolvedWorkspaceId;
    req.query.workspaceId = resolvedWorkspaceId;

    const isOwner = workspace.ownerId.toString() === userId;
    const isMember =
      Array.isArray(workspace.members) &&
      workspace.members.some((m: any) => m.toString() === userId);

    if (!isOwner && !isMember) {
      return res
        .status(403)
        .json({ message: "Forbidden: you are not a workspace member" });
    }

    req.workspaceMember = {
      workspaceId: resolvedWorkspaceId,
      role: isOwner ? "OWNER" : "MEMBER",
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check user is member of workspace.
 * Role inference for current schema:
 * - ownerId === userId -> OWNER
 * - otherwise if in members[] -> MEMBER
 */
export const requireWorkspaceMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const workspaceId = (req.params.workspaceId ||
      req.query.workspaceId) as string;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!workspaceId) {
      return res.status(400).json({ message: "workspaceId is required" });
    }

    const workspace = await Workspace.findOne(
      Types.ObjectId.isValid(workspaceId)
        ? { $or: [{ _id: workspaceId }, { slug: workspaceId }] }
        : { slug: workspaceId },
    )
      .select("_id ownerId members")
      .lean();
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const resolvedWorkspaceId = workspace._id.toString();

    req.params.workspaceId = resolvedWorkspaceId;
    req.query.workspaceId = resolvedWorkspaceId;

    const isOwner = workspace.ownerId.toString() === userId;
    const isMember = workspace.members.some(
      (m: any) => m.toString() === userId,
    );

    if (!isOwner && !isMember) {
      return res
        .status(403)
        .json({ message: "Forbidden: you are not a workspace member" });
    }

    req.workspaceMember = {
      workspaceId: resolvedWorkspaceId,
      role: isOwner ? "OWNER" : "MEMBER",
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireWorkspaceRole = (...roles: WorkspaceRole[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // Ensure workspace context available.
      if (!req.workspaceMember) {
        await new Promise<void>((resolve, reject) => {
          requireWorkspaceMember(req, res, (err?: any) =>
            err ? reject(err) : resolve(),
          );
        });
      }

      const currentRole = req.workspaceMember?.role;
      if (!currentRole || !roles.includes(currentRole)) {
        return res.status(403).json({
          message: `Forbidden: required role ${roles.join(" or ")}`,
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
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const channelId = req.params.channelId as string;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!channelId) {
      return res.status(400).json({ message: "channelId is required" });
    }

    // Prefer ChannelMember collection
    const channelMember = await ChannelMember.findOne({ channelId, userId })
      .select("role channelId")
      .lean();

    if (channelMember) {
      req.channelMember = {
        channelId,
        role: channelMember.role,
      };
      return next();
    }

    // Fallback to Channel.members[] for backward compatibility
    const channel = await Channel.findById(channelId).select("members").lean();
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const isMember = channel.members.some((m: any) => m.toString() === userId);
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "Forbidden: you are not a channel member" });
    }

    req.channelMember = {
      channelId,
      role: "member",
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Favorite permission:
 * - public channel: workspace member is enough
 * - private channel: must be channel member
 */
export const requireFavoriteAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const channelId = req.params.channelId as string;

    if (!channelId) {
      return res.status(400).json({ message: "channelId is required" });
    }

    const channel = await Channel.findById(channelId).select("type").lean();

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Always require workspace membership first.
    await new Promise<void>((resolve, reject) => {
      requireWorkspaceMemberByChannel(req, res, (err?: any) =>
        err ? reject(err) : resolve(),
      );
    });

    if (channel.type === "private") {
      await new Promise<void>((resolve, reject) => {
        requireChannelMember(req, res, (err?: any) =>
          err ? reject(err) : resolve(),
        );
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
