import { NextFunction, Request, Response } from "express";
import User from "../models/User.model";
import { AppError } from "../utils/AppError";

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError("Can dang nhap de thuc hien thao tac nay", 401, "AUTH_REQUIRED");
    }

    const { name, avatar } = req.body as { name?: string; avatar?: string };
    const updates: { name?: string; avatar?: string } = {};

    if (name !== undefined) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new AppError("Nguoi dung khong con ton tai", 401, "USER_NOT_FOUND");
    }

    res.status(200).json({
      success: true,
      message: "Cap nhat ho so thanh cong",
      data: {
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          avatar: user.avatar || "",
          role: user.role,
          workspaces: user.workspaces.map((item) => ({
            workspaceId: String(item.workspaceId),
            role: item.role,
          })),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
