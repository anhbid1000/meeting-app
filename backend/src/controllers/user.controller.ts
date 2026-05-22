import { NextFunction, Request, Response } from "express";
import User from "../models/User.model";
import { AppError } from "../utils/AppError";
import * as userService from "../services/user.service";

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, avatar } = req.body as { name?: string; avatar?: string };
    const updates: { name?: string; avatar?: string } = {};

    if (name !== undefined) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user!.id, updates, {
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

export const findUsersByKeyword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { keyword } = req.query as { keyword?: string };
    if (!keyword) {
      throw new AppError("Can cung cap tu khoa", 400, "KEYWORD_REQUIRED");
    }



    const users = await userService.findUsersByKeyword(keyword);

    res.status(200).json({
      success: true,
      message: "Tim kiem thanh cong",
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};
