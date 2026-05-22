import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import User from "../models/User.model";
import Workspace from "../models/Workspace.model";
import Channel from "../models/Channel.model";
import * as workspaceService from "../services/Workspace.service";
import { sendWorkspaceAddedEmail, sendWorkspaceJoinApprovedEmail } from "../services/mail.service";
import { WorkspaceRole } from "../types";
import { AppError } from "../utils/AppError";

export const handleCreateWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Can dang nhap de thuc hien thao tac nay", 401, "AUTH_REQUIRED");
    }

    const { name, description, categoryId, members, channelSetup, customChannel } = req.body;

    const workspace = await workspaceService.createWorkspace({
      name,
      description,
      categoryId,
      members,
      ownerId: userId,
      channelSetup,
      customChannel,
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

export const getWorkspaceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const appRole = req.user?.role;
    const workspaceId = String(req.params.workspaceId || "");

    if (!userId) {
      throw new AppError("Can dang nhap de thuc hien thao tac nay", 401, "AUTH_REQUIRED");
    }

    const result = await workspaceService.getWorkspaceById(workspaceId, userId, appRole);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const addWorkspaceMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorId = req.user!.id;
    const { email, role = "member" } = req.body as { email?: string; role?: WorkspaceRole };

    if (!email) {
      throw new AppError("Email thanh vien la bat buoc", 400, "VALIDATION_ERROR");
    }

    if (!["admin", "owner", "member"].includes(role)) {
      throw new AppError("Vai tro workspace phai la admin, owner hoac member", 400, "VALIDATION_ERROR");
    }

    const workspace = req.workspace!;

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
      // Add user to all public channels in this workspace
      await Channel.updateMany(
        { workspaceId: workspace._id, type: "public" },
        { $addToSet: { members: memberId } }
      );
    }

    const existingUserWorkspace = member.workspaces.find((item) => String(item.workspaceId) === String(workspace._id));
    if (existingUserWorkspace) {
      existingUserWorkspace.role = role;
    } else {
      member.workspaces.push({
        workspaceId: new Types.ObjectId(String(workspace._id)),
        role,
      });
    }

    await Promise.all([workspace.save(), member.save()]);

    if (!existingMember) {
      const actor = await User.findById(actorId).select("name").lean();
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const workspaceUrl = `${frontendUrl}/groups/${workspace._id}`;

      sendWorkspaceAddedEmail({
        to: member.email,
        name: member.name,
        workspaceName: workspace.name,
        workspaceUrl,
        inviterName: actor?.name,
      }).catch((err) => console.error("Failed to send workspace added email", err));
    }

    res.status(200).json({
      success: true,
      message: "Luu thanh vien workspace thanh cong",
      data: { workspace },
    });
  } catch (error) {
    next(error);
  }
};

export const removeWorkspaceMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorId = req.user!.id;
    const memberId = String(req.params.memberId);

    const workspace = req.workspace!;
    const isSelf = actorId === memberId;
    const actorMembership = workspace.members.find((member) => String(member.userId) === actorId);
    const isOwner = actorMembership?.role === "owner";


    const member = await User.findById(memberId);
    if (!member) {
      throw new AppError("Khong tim thay nguoi dung", 404, "USER_NOT_FOUND");
    }

    const existingMember = workspace.members.find((item) => String(item.userId) === memberId);
    if (!existingMember) {
      throw new AppError("Nguoi dung khong phai la thanh vien workspace", 400, "MEMBER_NOT_FOUND");
    }
    const isPending = existingMember.role === "pending";

    if (!isSelf && existingMember.role === "owner") {
      throw new AppError("Không thể xoá Owner khỏi workspace. Owner cần tự rời để hệ thống chuyển quyền.", 400, "CANNOT_REMOVE_OWNER");
    }

    let successorId: string | null = null;
    if (isSelf && isOwner) {
      const candidates = workspace.members
        .filter((item) => String(item.userId) !== memberId && item.role !== "pending")
        .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

      const successor = candidates.find((item) => item.role === "admin") || candidates.find((item) => item.role === "member");
      if (!successor) {
        throw new AppError("Owner không thể rời workspace khi chưa có thành viên khác để nhận quyền", 400, "NO_OWNER_SUCCESSOR");
      }

      successor.role = "owner";
      workspace.ownerId = successor.userId;
      successorId = String(successor.userId);
    }

    workspace.members = workspace.members.filter((item) => String(item.userId) !== memberId);
    member.workspaces = member.workspaces.filter((item) => String(item.workspaceId) !== String(workspace._id));

    const operations: Promise<unknown>[] = [
      workspace.save(),
      member.save(),
      Channel.updateMany(
        { workspaceId: workspace._id },
        { $pull: { members: member._id } }
      )
    ];

    if (successorId) {
      operations.push(
        User.updateOne(
          { _id: new Types.ObjectId(successorId), 'workspaces.workspaceId': workspace._id },
          { $set: { 'workspaces.$.role': 'owner' } }
        )
      );
    }

    await Promise.all(operations);

    res.status(200).json({
      success: true,
      message: isSelf
        ? "Bạn đã rời khỏi workspace thành công"
        : (isPending ? "Từ chối yêu cầu tham gia thành công" : "Xoa thanh vien khoi workspace thanh cong"),
      data: { workspace },
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkspaceMemberRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorId = req.user?.id;
    const workspaceId = String(req.params.workspaceId || "");
    const { updates } = req.body as { updates?: Array<{ memberId: string; role: "admin" | "member" }> };

    if (!actorId) {
      throw new AppError("Can dang nhap de thuc hien thao tac nay", 401, "AUTH_REQUIRED");
    }

    if (!Array.isArray(updates)) {
      throw new AppError("Danh sach thay doi vai tro la bat buoc", 400, "VALIDATION_ERROR");
    }

    const workspace = await workspaceService.updateWorkspaceMemberRoles(workspaceId, actorId, updates);

    return res.status(200).json({
      success: true,
      message: "Cap nhat vai tro thanh vien thanh cong",
      data: { workspace },
    });
  } catch (error) {
    next(error);
  }
};

export const approveWorkspaceMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorId = req.user!.id;
    const memberId = String(req.params.memberId);

    const workspace = req.workspace!;

    const member = await User.findById(memberId);
    if (!member) {
      throw new AppError("Khong tim thay nguoi dung", 404, "USER_NOT_FOUND");
    }

    const targetMembership = workspace.members.find((item) => String(item.userId) === memberId);
    if (!targetMembership) {
      throw new AppError("Nguoi dung khong phai la thanh vien hoac dang cho duyet trong workspace nay", 400, "MEMBER_NOT_FOUND");
    }

    if (targetMembership.role !== "pending") {
      return res.status(200).json({
        success: true,
        message: "Nguoi dung da duoc duyet tu truoc",
        data: { workspace },
      });
    }

    // Check member limit based on plan
    const planKey = String(workspace.plan || "free").toLowerCase();
    const memberLimit = planKey === "pro" ? 500 : 50;
    const activeMemberCount = workspace.members.filter(m => m.role !== "pending").length;
    if (activeMemberCount >= memberLimit) {
      throw new AppError(`Workspace da dat gioi han thanh vien (${memberLimit})`, 400, "WORKSPACE_MEMBER_LIMIT_EXCEEDED");
    }

    // Update role in Workspace members
    targetMembership.role = "member";

    // Update role in User workspaces
    const userWorkspace = member.workspaces.find((item) => String(item.workspaceId) === String(workspace._id));
    if (userWorkspace) {
      userWorkspace.role = "member";
    } else {
      member.workspaces.push({
        workspaceId: new Types.ObjectId(String(workspace._id)),
        role: "member",
      });
    }

    await Promise.all([
      workspace.save(),
      member.save(),
      Channel.updateMany(
        { workspaceId: workspace._id, type: "public" },
        { $addToSet: { members: member._id } }
      )
    ]);

    // Send notification email
    const actor = await User.findById(actorId).select("name").lean();
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const workspaceUrl = `${frontendUrl}/groups/${workspace._id}`;

    sendWorkspaceJoinApprovedEmail({
      to: member.email,
      name: member.name,
      workspaceName: workspace.name,
      workspaceUrl,
      approverName: actor?.name,
    }).catch((err) => console.error("Failed to send workspace approval email", err));

    res.status(200).json({
      success: true,
      message: "Duyet thanh vien vao workspace thanh cong",
      data: { workspace },
    });
  } catch (error) {
    next(error);
  }
};
