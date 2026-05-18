import { Request, Response, NextFunction } from 'express';
import * as workspaceService from '../services/Workspace.service';

export const handleCreateWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Lấy userId từ auth middleware (thằng đang đăng nhập)
    const userId = (req as any).user.id;

    // 2. Gọi service để xử lý tạo workspace
    const workspace = await workspaceService.createWorkspace({
      name: req.body.name,
      description: req.body.description,
      ownerId: userId
    });

    // 3. Trả về cho client
    return res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      data: workspace
    });
  } catch (error) {
    next(error); // Đẩy lỗi cho middleware xử lý lỗi tập trung
  }
};

export const deleteWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw = req.query.workspaceId;
    const workspaceId = typeof raw === 'string' ? raw : ''; // Lấy workspaceId từ query params
    const userId = (req as any).user.id; // Lấy từ auth middleware

    await workspaceService.deleteWorkspace(workspaceId, userId);

    res.status(204).send(); // 204 No Content là chuẩn cho xóa thành công
  } catch (error) {
    next(error);
  }
};

export const getMyWorkspaces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id as string;

    const rawPage = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
    const rawLimit = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;

    const page = Number(rawPage) > 0 ? Number(rawPage) : 1;
    const limit = Number(rawLimit) > 0 ? Number(rawLimit) : 10;

    const result = await workspaceService.getMyWorkspaces(userId, page, limit);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};