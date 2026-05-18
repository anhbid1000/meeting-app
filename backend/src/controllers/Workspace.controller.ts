import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import User from "../models/User.model";
import Workspace from "../models/Workspace.model";
import * as workspaceService from "../services/Workspace.service";
import { WorkspaceRole } from "../types";
import { AppError } from "../utils/AppError";

export const handleCreateWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Can dang nhap de thuc hien thao tac nay", 401, "AUTH_REQUIRED");
    }

    const workspace = await workspaceService.createWorkspace({
      name: req.body.name,
      description: req.body.description,
      ownerId: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Tao workspace thanh cong",
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = String(req.params.workspaceId);
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Can dang nhap de thuc hien thao tac nay", 401, "AUTH_REQUIRED");
    }

    await workspaceService.deleteWorkspace(workspaceId, userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getMyWorkspaces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Can dang nhap de thuc hien thao tac nay", 401, "AUTH_REQUIRED");
    }

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

export const addWorkspaceMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorId = req.user?.id;
    const workspaceId = String(req.params.workspaceId);
    const { email, role = "member" } = req.body as { email?: string; role?: WorkspaceRole };

    if (!actorId) {
      throw new AppError("Can dang nhap de thuc hien thao tac nay", 401, "AUTH_REQUIRED");
    }

    if (!email) {
      throw new AppError("Email thanh vien la bat buoc", 400, "VALIDATION_ERROR");
    }

    if (!["admin", "owner", "member"].includes(role)) {
      throw new AppError("Vai tro workspace phai la admin, owner hoac member", 400, "VALIDATION_ERROR");
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new AppError("Khong tim thay workspace", 404, "WORKSPACE_NOT_FOUND");
    }

    const actorMembership = workspace.members.find((member) => String(member.userId) === actorId);
    const canManage = req.user?.role === "admin" || actorMembership?.role === "owner" || actorMembership?.role === "admin";
    if (!canManage) {
      throw new AppError("Ban khong co quyen trong workspace nay", 403, "WORKSPACE_FORBIDDEN");
    }

    const member = await User.findOne({ email: email.toLowerCase() });
    if (!member) {
      throw new AppError("Khong tim thay nguoi dung", 404, "USER_NOT_FOUND");
    }

    const memberId = new Types.ObjectId(String(member._id));
    const existingMember = workspace.members.find((item) => String(item.userId) === String(memberId));

    if (existingMember) {
      existingMember.role = role;
    } else {
      workspace.members.push({
        userId: memberId,
        role,
        joinedAt: new Date(),
      });
    }

    const existingUserWorkspace = member.workspaces.find((item) => String(item.workspaceId) === workspaceId);
    if (existingUserWorkspace) {
      existingUserWorkspace.role = role;
    } else {
      member.workspaces.push({
        workspaceId: new Types.ObjectId(workspaceId),
        role,
      });
    }

    await Promise.all([workspace.save(), member.save()]);

    res.status(200).json({
      success: true,
      message: "Luu thanh vien workspace thanh cong",
      data: { workspace },
    });
  } catch (error) {
    next(error);
  }
};
