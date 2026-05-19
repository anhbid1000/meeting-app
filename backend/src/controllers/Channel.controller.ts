import { Request, Response, NextFunction } from 'express';
import { ChannelService } from '../services/Channel.service';
import Channel from '../models/Channel.model';

const parseParam = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

export const getChannelDirectory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workspaceId } = req.params;
    const { search, type, category, page, limit, sort } = req.query;

    const result = await ChannelService.getChannelDirectory(parseParam(workspaceId), {
      search: parseParam(search as any),
      type: parseParam(type as any) as 'public' | 'private' | undefined,
      category: parseParam(category as any),
      page: page ? Number(parseParam(page as any)) : 1,
      limit: limit ? Number(parseParam(limit as any)) : 20,
      sort: (parseParam(sort as any) as any) || 'activity'
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getChannel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const channelId = parseParam(req.params.channelId);
    const channel = await Channel.findById(channelId)
      .populate('members', 'name email')
      .lean();
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    return res.status(200).json({ success: true, data: channel });
  } catch (error) {
    next(error);
  }
};

export const createChannel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const workspaceId = parseParam(req.params.workspaceId);

    const channel = await ChannelService.createChannel({
      workspaceId,
      userId,
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      category: req.body.category
    });

    return res.status(201).json({
      success: true,
      message: 'Channel created successfully',
      data: channel
    });
  } catch (error) {
    next(error);
  }
};

export const updateChannel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const channelId = parseParam(req.params.channelId);

    const channel = await ChannelService.updateChannel({
      channelId,
      userId,
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      category: req.body.category,
      isArchived: req.body.isArchived
    });

    return res.status(200).json({
      success: true,
      data: channel
    });
  } catch (error) {
    next(error);
  }
};

export const deleteChannel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const channelId = parseParam(req.params.channelId);
    await ChannelService.deleteChannel({ channelId, userId });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const archiveChannel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const channelId = parseParam(req.params.channelId);
    const channel = await ChannelService.archiveChannel({ channelId, userId });
    return res.status(200).json(channel);
  } catch (error) {
    next(error);
  }
};
