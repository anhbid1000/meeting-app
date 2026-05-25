import { Request, Response, NextFunction } from "express";
import Workspace from "../models/Workspace.model";
import { AppError } from "../utils/AppError";

/**
 * Middleware yêu cầu người dùng phải là Quản trị viên (Admin/Owner) của Workspace
 * hoặc là Admin hệ thống.
 */
export const requireWorkspaceAdminOrOwner = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const actorId = req.user?.id;
    const workspaceId = req.params.workspaceId || req.body.workspaceId;

    if (!actorId) {
      throw new AppError("Can dang nhap de thuc hien thao tac nay", 401, "AUTH_REQUIRED");
    }

    if (!workspaceId) {
      throw new AppError("workspaceId la bat buoc", 400, "WORKSPACE_REQUIRED");
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new AppError("Khong tim thay workspace", 404, "WORKSPACE_NOT_FOUND");
    }

    // Admin hệ thống được phép bypass qua kiểm tra
    if (req.user?.role === "admin") {
      req.workspace = workspace;
      return next();
    }

    const actorMembership = workspace.members.find(
      (member) => String(member.userId) === actorId
    );

    const canManage =
      actorMembership?.role === "owner" || actorMembership?.role === "admin";

    if (!canManage) {
      throw new AppError(
        "Ban khong co quyen trong workspace nay",
        403,
        "WORKSPACE_FORBIDDEN"
      );
    }

    req.workspace = workspace;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware yêu cầu người dùng phải là Quản trị viên (Admin/Owner) của Workspace,
 * hoặc chính người đó tự thực hiện hành động trên bản thân (ví dụ: tự rời workspace).
 */
export const requireWorkspaceAdminOrSelf = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const actorId = req.user?.id;
    const workspaceId = req.params.workspaceId;
    const memberId = req.params.memberId;

    if (!actorId) {
      throw new AppError("Can dang nhap de thuc hien thao tac nay", 401, "AUTH_REQUIRED");
    }

    if (!workspaceId) {
      throw new AppError("workspaceId la bat buoc", 400, "WORKSPACE_REQUIRED");
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new AppError("Khong tim thay workspace", 404, "WORKSPACE_NOT_FOUND");
    }

    const isSelf = actorId === memberId;

    // Admin hệ thống được phép bypass qua kiểm tra
    if (req.user?.role === "admin") {
      req.workspace = workspace;
      return next();
    }

    const actorMembership = workspace.members.find(
      (member) => String(member.userId) === actorId
    );

    const canManage =
      actorMembership?.role === "owner" ||
      actorMembership?.role === "admin" ||
      isSelf;

    if (!canManage) {
      throw new AppError(
        "Ban khong co quyen trong workspace nay",
        403,
        "WORKSPACE_FORBIDDEN"
      );
    }

    req.workspace = workspace;
    next();
  } catch (error) {
    next(error);
  }
};
