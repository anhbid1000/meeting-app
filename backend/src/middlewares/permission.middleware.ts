
import { Types } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { WorkspaceRole } from "../types";
import Workspace from "../models/Workspace.model";
import ChannelMember from "../models/ChannelMember.model";
import Channel from "../models/Channel.model";

const getMemberUserId = (member: any): string | null => {
  if (!member) return null;

  if (member.userId) {
    return String(member.userId);
  }

  if (member._id) {
    return String(member._id);
  }

  return String(member);
};

const isWorkspaceMember = (members: any[], userId: string) => {
  return members.some((member: any) => getMemberUserId(member) === userId);
};

export const requireWorkspaceMemberByChannel = async (
  req: Request,
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

    if (!Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channelId" });
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

    const resolvedWorkspaceId = String(workspace._id);

    req.params.workspaceId = resolvedWorkspaceId;
    (req.query as any).workspaceId = resolvedWorkspaceId;

    const members = Array.isArray(workspace.members) ? workspace.members : [];

    const isOwner = String(workspace.ownerId) === userId;
    const isMember = isWorkspaceMember(members, userId);

    if (!isOwner && !isMember) {
      return res
        .status(403)
        .json({ message: "Forbidden: you are not a workspace member" });
    }

    req.workspaceMember = {
      workspaceId: resolvedWorkspaceId,
      role: isOwner ? "owner" : "member",
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireWorkspaceMember = async (
  req: Request,
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

    const resolvedWorkspaceId = String(workspace._id);

    req.params.workspaceId = resolvedWorkspaceId;
    (req.query as any).workspaceId = resolvedWorkspaceId;

    const members = Array.isArray(workspace.members) ? workspace.members : [];

    const isOwner = String(workspace.ownerId) === userId;
    const isMember = isWorkspaceMember(members, userId);

    if (!isOwner && !isMember) {
      return res
        .status(403)
        .json({ message: "Forbidden: you are not a workspace member" });
    }

    req.workspaceMember = {
      workspaceId: resolvedWorkspaceId,
      role: isOwner ? "owner" : "member",
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireWorkspaceRole = (...roles: WorkspaceRole[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
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

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export const requireChannelMember = async (
  req: Request,
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

    if (!Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channelId" });
    }

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

    const channel = await Channel.findById(channelId).select("members").lean();

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const members = Array.isArray(channel.members) ? channel.members : [];
    const isMember = isWorkspaceMember(members, userId);

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "Forbidden: you are not a channel member" });
    }

    req.channelMember = {
      channelId,
      role: "member",
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireFavoriteAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const channelId = req.params.channelId as string;

    if (!channelId) {
      return res.status(400).json({ message: "channelId is required" });
    }

    if (!Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channelId" });
    }

    const channel = await Channel.findById(channelId).select("type").lean();

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

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

    return next();
  } catch (error) {
    return next(error);
  }
};