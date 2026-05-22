import { Request, Response, NextFunction } from 'express';
import * as fileAssetService from '../services/FileAsset.service';
import { AppError } from '../utils/AppError';

export const listWorkspaceFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Cần đăng nhập để thực hiện thao tác này', 401, 'AUTH_REQUIRED');
    }

    const workspaceId = String(req.params.workspaceId || '');
    const result = await fileAssetService.listWorkspaceFiles(workspaceId, userId, req.user?.role);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadWorkspaceFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Cần đăng nhập để thực hiện thao tác này', 401, 'AUTH_REQUIRED');
    }

    if (!req.file) {
      throw new AppError('File upload là bắt buộc', 400, 'FILE_REQUIRED');
    }

    const workspaceId = String(req.params.workspaceId || '');
    const channelId = String(req.body.channelId || '');

    const result = await fileAssetService.uploadWorkspaceFile({
      workspaceId,
      channelId,
      userId,
      appRole: req.user?.role,
      file: req.file,
    });

    return res.status(201).json({
      success: true,
      message: 'Upload file thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Cần đăng nhập để thực hiện thao tác này', 401, 'AUTH_REQUIRED');
    }

    const { fileId } = req.params;
    const file = await fileAssetService.getWorkspaceFile(String(fileId), userId, req.user?.role);

    return res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkspaceFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Cần đăng nhập để thực hiện thao tác này', 401, 'AUTH_REQUIRED');
    }

    const { fileId } = req.params;
    const result = await fileAssetService.deleteWorkspaceFile(String(fileId), userId, req.user?.role);

    return res.status(200).json({
      success: true,
      message: 'Xoá file thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Cần đăng nhập để thực hiện thao tác này', 401, 'AUTH_REQUIRED');
    }

    const { fileId } = req.params;
    const signedUrl = await fileAssetService.getSignedDownloadUrl(String(fileId), userId, req.user?.role);

    return res.status(200).json({
      success: true,
      data: { downloadUrl: signedUrl },
    });
  } catch (error) {
    next(error);
  }
};
