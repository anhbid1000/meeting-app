import { NextFunction, Request, Response } from "express";
import User from "../models/User.model";
import { AppError } from "../utils/AppError";
import * as userService from "../services/user.service";
import { sendSubscriptionExpiredEmail, sendUpgradeProEmail } from "../services/mail.service";
import Workspace from "../models/Workspace.model";

export const upgradeToPro = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401, "AUTH_REQUIRED");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Nâng cấp lên Pro, 24 giờ
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 24);

    user.plan = "pro";
    user.subscriptionPlan = "pro";
    user.subscriptionExpireTime = expireTime;
    await user.save();

    // Cập nhật tất cả Workspace mà User là Owner lên Pro
    // Mặc định limit được handle trong code service qua check user.plan hoặc workspace.plan
    // Ở đây ta set workspace.plan = 'pro' để đồng bộ
    await Workspace.updateMany(
      {
        $or: [
          { ownerId: userId },
        ],
      },
      { $set: { plan: "pro" } }
    );

    // Gửi email thông báo (best-effort)
    try {
      await sendUpgradeProEmail({
        email: user.email,
        name: user.name,
        expireTime,
      });
    } catch (mailError) {
      // Không chặn luồng nâng cấp nếu SMTP cấu hình lỗi
      console.error("Failed to send upgrade email", mailError);
    }

    res.status(200).json({
      success: true,
      message: "Nâng cấp gói Pro thành công",
      data: {
        plan: user.plan,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionExpireTime: user.subscriptionExpireTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const checkAndDowngradePlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401, "AUTH_REQUIRED");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const expireAt = user.subscriptionExpireTime ? new Date(user.subscriptionExpireTime) : null;
    const isPro = String(user.subscriptionPlan || user.plan || "free").toLowerCase() === "pro";

    if (!isPro || !expireAt) {
      return res.status(200).json({
        success: true,
        message: "Không cần hạ gói",
        data: {
          downgraded: false,
          plan: user.plan || "free",
          subscriptionPlan: user.subscriptionPlan || user.plan || "free",
          subscriptionExpireTime: user.subscriptionExpireTime || null,
        },
      });
    }

    if (new Date() < expireAt) {
      return res.status(200).json({
        success: true,
        message: "Gói Pro vẫn còn hạn",
        data: {
          downgraded: false,
          plan: user.plan,
          subscriptionPlan: user.subscriptionPlan,
          subscriptionExpireTime: user.subscriptionExpireTime,
        },
      });
    }

    user.plan = "free";
    user.subscriptionPlan = "free";
    user.subscriptionExpireTime = undefined;
    await user.save();

    await Workspace.updateMany(
      {
        $or: [
          { ownerId: userId },
        ],
      },
      { $set: { plan: "free" } }
    );

    try {
      await sendSubscriptionExpiredEmail({ email: user.email, name: user.name });
    } catch (mailError) {
      console.error("Failed to send subscription expired email", mailError);
    }

    return res.status(200).json({
      success: true,
      message: "Gói Pro đã hết hạn và được chuyển về Free",
      data: {
        downgraded: true,
        plan: user.plan,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionExpireTime: null,
      },
    });
  } catch (error) {
    next(error);
  }
};

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
