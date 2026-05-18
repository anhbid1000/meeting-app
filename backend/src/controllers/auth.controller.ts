import bcrypt from "bcryptjs";
import crypto from "crypto";
import { CookieOptions, NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../models/User.model";
import { AppRole } from "../types";
import { AppError } from "../utils/AppError";
import { getCookie, REFRESH_COOKIE_NAME } from "../utils/cookies";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/token";

const refreshTokenMaxAgeMs = 7 * 24 * 60 * 60 * 1000;

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: refreshTokenMaxAgeMs,
};

const toSafeUser = (user: IUser) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  avatar: user.avatar || "",
  role: user.role,
  workspaces: user.workspaces.map((item) => ({
    workspaceId: String(item.workspaceId),
    role: item.role,
  })),
});

const issueTokens = async (res: Response, user: IUser, userAgent?: string) => {
  const authUser = {
    id: String(user._id),
    email: user.email,
    role: user.role as AppRole,
  };
  const accessToken = signAccessToken(authUser);
  const refreshToken = signRefreshToken(authUser);
  const tokenHash = await bcrypt.hash(refreshToken, 12);

  user.refreshTokens = user.refreshTokens.filter((item) => item.expiresAt > new Date());
  user.refreshTokens.push({
    tokenHash,
    userAgent,
    expiresAt: new Date(Date.now() + refreshTokenMaxAgeMs),
    createdAt: new Date(),
  });

  await user.save();
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);

  return accessToken;
};

const findRefreshTokenIndex = async (user: IUser, token: string) => {
  for (let index = 0; index < user.refreshTokens.length; index += 1) {
    if (await bcrypt.compare(token, user.refreshTokens[index].tokenHash)) {
      return index;
    }
  }

  return -1;
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body as { name?: string; email?: string; password?: string };

    if (!name || !email || !password) {
      throw new AppError("Ten, email va mat khau la bat buoc", 400, "VALIDATION_ERROR");
    }

    if (password.length < 8) {
      throw new AppError("Mat khau phai co it nhat 8 ky tu", 400, "WEAK_PASSWORD");
    }

    const existing = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      throw new AppError("Email da ton tai", 409, "EMAIL_EXISTS");
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "member",
    });

    const accessToken = await issueTokens(res, user, req.headers["user-agent"]);

    res.status(201).json({
      success: true,
      message: "Dang ky thanh cong",
      data: {
        user: toSafeUser(user),
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      throw new AppError("Email va mat khau la bat buoc", 400, "VALIDATION_ERROR");
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password +refreshTokens");
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError("Email hoac mat khau khong dung", 401, "INVALID_CREDENTIALS");
    }

    const accessToken = await issueTokens(res, user, req.headers["user-agent"]);

    res.status(200).json({
      success: true,
      message: "Dang nhap thanh cong",
      data: {
        user: toSafeUser(user),
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = getCookie(req, REFRESH_COOKIE_NAME);
    if (!refreshToken) {
      throw new AppError("Can refresh token de cap lai phien dang nhap", 401, "REFRESH_REQUIRED");
    }

    const decoded = verifyRefreshToken(refreshToken) as JwtPayload;
    if (!decoded.sub || typeof decoded.sub !== "string") {
      throw new AppError("Refresh token khong hop le", 401, "REFRESH_INVALID");
    }

    const user = await User.findById(decoded.sub).select("+refreshTokens");
    if (!user) {
      throw new AppError("Nguoi dung khong con ton tai", 401, "USER_NOT_FOUND");
    }

    const tokenIndex = await findRefreshTokenIndex(user, refreshToken);
    if (tokenIndex < 0) {
      user.refreshTokens = [];
      await user.save();
      throw new AppError("Refresh token da bi thu hoi", 401, "REFRESH_REVOKED");
    }

    user.refreshTokens.splice(tokenIndex, 1);
    const accessToken = await issueTokens(res, user, req.headers["user-agent"]);

    res.status(200).json({
      success: true,
      data: {
        user: toSafeUser(user),
        accessToken,
      },
    });
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Refresh token khong hop le", 401, "REFRESH_INVALID"));
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = getCookie(req, REFRESH_COOKIE_NAME);

    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken) as JwtPayload;
      if (decoded.sub && typeof decoded.sub === "string") {
        const user = await User.findById(decoded.sub).select("+refreshTokens");
        if (user) {
          const tokenIndex = await findRefreshTokenIndex(user, refreshToken);
          if (tokenIndex >= 0) {
            user.refreshTokens.splice(tokenIndex, 1);
            await user.save();
          }
        }
      }
    }

    res.clearCookie(REFRESH_COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
    res.status(200).json({ success: true, message: "Dang xuat thanh cong" });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError("Can dang nhap de thuc hien thao tac nay", 401, "AUTH_REQUIRED");
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError("Nguoi dung khong con ton tai", 401, "USER_NOT_FOUND");
    }

    res.status(200).json({
      success: true,
      data: {
        user: toSafeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      throw new AppError("Email la bat buoc", 400, "VALIDATION_ERROR");
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+passwordResetTokenHash +passwordResetExpires"
    );
    const resetToken = crypto.randomBytes(32).toString("hex");

    if (user) {
      user.passwordResetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      // Khi co dich vu gui email, gan provider tai day. O moi truong dev tra token de de test.
    }

    res.status(200).json({
      success: true,
      message: "Neu email ton tai, huong dan dat lai mat khau da duoc gui",
      ...(process.env.NODE_ENV !== "production" && user ? { data: { resetToken } } : {}),
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body as { token?: string; password?: string };
    if (!token || !password) {
      throw new AppError("Token va mat khau la bat buoc", 400, "VALIDATION_ERROR");
    }

    if (password.length < 8) {
      throw new AppError("Mat khau phai co it nhat 8 ky tu", 400, "WEAK_PASSWORD");
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password +refreshTokens +passwordResetTokenHash +passwordResetExpires");

    if (!user) {
      throw new AppError("Token dat lai mat khau khong hop le hoac da het han", 400, "RESET_TOKEN_INVALID");
    }

    user.password = password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = [];
    await user.save();

    res.clearCookie(REFRESH_COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
    res.status(200).json({ success: true, message: "Mat khau da duoc dat lai" });
  } catch (error) {
    next(error);
  }
};
