import { Request, Response, NextFunction } from 'express';
import * as channelService from '../services/Channel.service';
import { AppError } from '../utils/AppError';

export const createChannel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Cần đăng nhập để thực hiện thao tác này', 401, 'AUTH_REQUIRED');
    }

    const { workspaceId } = req.params as { workspaceId: string };
    const { name, description, type, memberIds } = req.body as { name: string, description?: string, type: 'public' | 'private', memberIds?: string[] };

    if (!name || !name.trim()) {
      throw new AppError('Tên channel là bắt buộc', 400, 'VALIDATION_ERROR');
    }

    if (!['public', 'private'].includes(type)) {
      throw new AppError('Trạng thái channel phải là public hoặc private', 400, 'VALIDATION_ERROR');
    }

    const channel = await channelService.createChannel({
      workspaceId,
      name,
      description,
      type,
      createdBy: userId,
      memberIds: type === 'private' ? memberIds : undefined
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo channel thành công',
      data: { channel }
    });
  } catch (error) {
    next(error);
  }
};
