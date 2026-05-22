import { Request, Response, NextFunction } from "express";
import { ChannelMemberService } from "../services/ChannelMember.service";
import { PermissionService } from "../services/Permission.service";
import Channel from "../models/Channel.model";

const parseParam = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

export const joinChannel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const channelId = parseParam(req.params.channelId);

    const canJoin = await PermissionService.canJoinChannel(userId, channelId);
    if (!canJoin) {
      return res
        .status(403)
        .json({ message: "Forbidden: cannot join this channel" });
    }

    const channel = await Channel.findById(channelId)
      .select("workspaceId")
      .lean();
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const member = await ChannelMemberService.addMember(
      channelId,
      userId,
      channel.workspaceId.toString(),
      "member",
    );

    return res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

export const leaveChannel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const channelId = parseParam(req.params.channelId);

    await ChannelMemberService.removeMember(channelId, userId);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getChannelMembers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const channelId = parseParam(req.params.channelId);
    const pageStr = Array.isArray(req.query.page)
      ? req.query.page[0]
      : req.query.page;
    const limitStr = Array.isArray(req.query.limit)
      ? req.query.limit[0]
      : req.query.limit;

    const result = await ChannelMemberService.getChannelMembers(
      channelId,
      pageStr ? Number(pageStr) : 1,
      limitStr ? Number(limitStr) : 20,
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const muteChannel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const channelId = parseParam(req.params.channelId);
    const { isMuted } = req.body;

    const member = await ChannelMemberService.muteChannel(
      channelId,
      userId,
      Boolean(isMuted),
    );
    return res.status(200).json(member);
  } catch (error) {
    next(error);
  }
};

export const favoriteChannel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const channelId = parseParam(req.params.channelId);
    const { isFavorite } = req.body;

    const member = await ChannelMemberService.favoriteChannel(
      channelId,
      userId,
      Boolean(isFavorite),
    );
    return res.status(200).json(member);
  } catch (error) {
    next(error);
  }
};

export const getInviteCandidates = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const channelId = parseParam(req.params.channelId);

    const canManage = await PermissionService.canModifyChannel(
      userId,
      channelId,
    );
    if (!canManage) {
      return res.status(403).json({
        message: "Forbidden: only channel/workspace owner or admin can invite",
      });
    }

    const result = await ChannelMemberService.getInviteCandidates(channelId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const inviteMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const inviterId = (req as any).user.id;
    const channelId = parseParam(req.params.channelId);
    const targetUserId = parseParam(req.body.userId);

    const canManage = await PermissionService.canModifyChannel(
      inviterId,
      channelId,
    );
    if (!canManage) {
      return res.status(403).json({
        message: "Forbidden: only channel/workspace owner or admin can invite",
      });
    }

    const result = await ChannelMemberService.inviteMember({
      channelId,
      inviterId,
      targetUserId,
    });

    return res.status(200).json({
      success: true,
      data: result,
      message: "Member invited successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const markChannelRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const channelId = parseParam(req.params.channelId);
    const rawTimestamp = req.body?.timestamp as string | undefined;

    const timestamp = rawTimestamp ? new Date(rawTimestamp) : new Date();
    if (Number.isNaN(timestamp.getTime())) {
      return res.status(422).json({ message: 'Invalid timestamp' });
    }

    const member = await ChannelMemberService.updateLastReadAt(
      channelId,
      userId,
      timestamp,
    );

    return res.status(200).json({
      success: true,
      data: {
        channelId,
        userId,
        lastReadAt: member.lastReadAt,
        unreadCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
