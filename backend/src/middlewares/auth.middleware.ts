import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import User from "../models/User.model";
import { AppRole, WorkspaceRole } from "../types";
import { AppError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/token";

export const auth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

    if (!token) {
      throw new AppError("Can token xac thuc", 401, "AUTH_REQUIRED");
    }

    const decoded = verifyAccessToken(token) as JwtPayload;
    if (!decoded.sub || typeof decoded.sub !== "string") {
      throw new AppError("Token xac thuc khong hop le", 401, "TOKEN_INVALID");
    }

    const user = await User.findById(decoded.sub).select("_id email role").lean();
    if (!user) {
      throw new AppError("Nguoi dung khong con ton tai", 401, "USER_NOT_FOUND");
    }

    req.user = {
      id: String(user._id),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Token xac thuc khong hop le", 401, "TOKEN_INVALID"));
  }
};

export const requireAppRole =
  (...roles: AppRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new AppError("Can dang nhap de thuc hien thao tac nay", 401, "AUTH_REQUIRED"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError("Ban khong co quyen thuc hien thao tac nay", 403, "FORBIDDEN"));
      return;
    }

    next();
  };

export const requireWorkspaceRole =
  (...roles: WorkspaceRole[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError("Can dang nhap de thuc hien thao tac nay", 401, "AUTH_REQUIRED");
      }

      if (req.user.role === "admin") {
        next();
        return;
      }

      const workspaceId = req.params.workspaceId || req.body.workspaceId;
      if (!workspaceId) {
        throw new AppError("workspaceId la bat buoc", 400, "WORKSPACE_REQUIRED");
      }

      const user = await User.findById(req.user.id).select("workspaces").lean();
      const membership = user?.workspaces.find((item) => String(item.workspaceId) === String(workspaceId));

      if (!membership || !roles.includes(membership.role)) {
        throw new AppError("Ban khong co quyen trong workspace nay", 403, "WORKSPACE_FORBIDDEN");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
