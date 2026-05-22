import bcrypt from "bcryptjs";
import crypto from "crypto";
import { CookieOptions, NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../models/User.model";
import { sendEmailVerificationEmail, sendPasswordResetEmail } from "../services/mail.service";
import { AppRole } from "../types";
import { AppError } from "../utils/AppError";
import { getCookie, REFRESH_COOKIE_NAME } from "../utils/cookies";
import { assertRateLimit, hitRateLimit, rateLimitKeys, resetRateLimit } from "../utils/rateLimit";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/token";

const refreshTokenMaxAgeMs = 7 * 24 * 60 * 60 * 1000;
const emailVerificationTokenMaxAgeMs = 24 * 60 * 60 * 1000;
const loginRateLimitMaxAttempts = 5;
const loginRateLimitWindowMs = 15 * 60 * 1000;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
  plan: user.plan || "free",
  subscriptionPlan: user.subscriptionPlan || user.plan || "free",
  emailVerified: user.emailVerified,
  workspaces: user.workspaces.map((item) => ({
    workspaceId: String(item.workspaceId),
    role: item.role,
  })),
});

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

const createEmailVerificationToken = () => crypto.randomBytes(32).toString("hex");

const setEmailVerificationToken = (user: IUser, token: string) => {
  user.emailVerificationTokenHash = hashToken(token);
  user.emailVerificationExpires = new Date(Date.now() + emailVerificationTokenMaxAgeMs);
};

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
      throw new AppError("Name, email, and password are required", 400, "VALIDATION_ERROR");
    }

    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters", 400, "WEAK_PASSWORD");
    }

    const existing = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      throw new AppError("An account with this email already exists", 409, "EMAIL_EXISTS");
    }

    const user = await User.create({
      name,
      email,
      password,
      authProvider: "local",
      role: "member",
    });

    const verificationToken = createEmailVerificationToken();
    setEmailVerificationToken(user, verificationToken);
    await user.save();
    await sendEmailVerificationEmail({
      to: user.email,
      name: user.name,
      verificationToken,
    });

    res.status(201).json({
      success: true,
      message: "Account created. Please check your email to verify your account",
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    const loginEmailKey = `login:${rateLimitKeys.emailOrIp(req)}`;
    const loginIpKey = `login:ip:${rateLimitKeys.ip(req)}`;

    if (!email || !password) {
      throw new AppError("Email and password are required", 400, "VALIDATION_ERROR");
    }

    assertRateLimit(
      loginEmailKey,
      loginRateLimitMaxAttempts,
      loginRateLimitWindowMs,
      "Too many failed sign-in attempts. Please try again later",
      "LOGIN_RATE_LIMITED"
    );
    assertRateLimit(
      loginIpKey,
      loginRateLimitMaxAttempts,
      loginRateLimitWindowMs,
      "Too many failed sign-in attempts from this network. Please try again later",
      "LOGIN_RATE_LIMITED"
    );

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password +refreshTokens");
    if (!user || !(await user.comparePassword(password))) {
      hitRateLimit(
        loginEmailKey,
        loginRateLimitMaxAttempts,
        loginRateLimitWindowMs,
        "Too many failed sign-in attempts. Please try again later",
        "LOGIN_RATE_LIMITED"
      );
      hitRateLimit(
        loginIpKey,
        loginRateLimitMaxAttempts,
        loginRateLimitWindowMs,
        "Too many failed sign-in attempts from this network. Please try again later",
        "LOGIN_RATE_LIMITED"
      );
      throw new AppError("Incorrect email or password", 401, "INVALID_CREDENTIALS");
    }

    if (!user.emailVerified) {
      throw new AppError("Please verify your email before signing in", 403, "EMAIL_NOT_VERIFIED");
    }

    resetRateLimit(loginEmailKey);
    resetRateLimit(loginIpKey);

    const accessToken = await issueTokens(res, user, req.headers["user-agent"]);

    res.status(200).json({
      success: true,
      message: "Signed in successfully",
      data: {
        user: toSafeUser(user),
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential } = req.body as { credential?: string };

    if (!credential) {
      throw new AppError("Google credential is required", 400, "GOOGLE_CREDENTIAL_REQUIRED");
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new AppError("GOOGLE_CLIENT_ID is missing", 500, "GOOGLE_CONFIG_MISSING");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.sub) {
      throw new AppError("Unable to read your Google account information", 401, "GOOGLE_PROFILE_MISSING");
    }

    if (!payload.email_verified) {
      throw new AppError("Your Google email is not verified", 401, "GOOGLE_EMAIL_NOT_VERIFIED");
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email }).select("+refreshTokens");

    if (!user) {
      user = await User.create({
        name: payload.name || email.split("@")[0],
        email,
        avatar: payload.picture || "",
        googleId: payload.sub,
        authProvider: "google",
        emailVerified: true,
        role: "member",
      });
    } else {
      user.googleId = user.googleId || payload.sub;
      user.authProvider = user.authProvider || "google";
      user.emailVerified = true;

      if (!user.avatar && payload.picture) {
        user.avatar = payload.picture;
      }

      await user.save();
    }

    const accessToken = await issueTokens(res, user, req.headers["user-agent"]);

    res.status(200).json({
      success: true,
      message: "Signed in with Google",
      data: {
        user: toSafeUser(user),
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body as { token?: string };
    if (!token) {
      throw new AppError("Verification token is required", 400, "VERIFY_TOKEN_REQUIRED");
    }

    const user = await User.findOne({
      emailVerificationTokenHash: hashToken(token),
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationTokenHash +emailVerificationExpires");

    if (!user) {
      throw new AppError("Verification token is invalid or has expired", 400, "VERIFY_TOKEN_INVALID");
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email has been verified",
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      throw new AppError("Email is required", 400, "VALIDATION_ERROR");
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+emailVerificationTokenHash +emailVerificationExpires"
    );

    if (user && !user.emailVerified) {
      const verificationToken = createEmailVerificationToken();
      setEmailVerificationToken(user, verificationToken);
      await user.save();
      await sendEmailVerificationEmail({
        to: user.email,
        name: user.name,
        verificationToken,
      });
    }

    res.status(200).json({
      success: true,
      message: "If this email needs verification, we sent new instructions",
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = getCookie(req, REFRESH_COOKIE_NAME);
    if (!refreshToken) {
      throw new AppError("A refresh token is required to renew your session", 401, "REFRESH_REQUIRED");
    }

    const decoded = verifyRefreshToken(refreshToken) as JwtPayload;
    if (!decoded.sub || typeof decoded.sub !== "string") {
      throw new AppError("Refresh token is invalid", 401, "REFRESH_INVALID");
    }

    const user = await User.findById(decoded.sub).select("+refreshTokens");
    if (!user) {
      throw new AppError("User no longer exists", 401, "USER_NOT_FOUND");
    }

    const tokenIndex = await findRefreshTokenIndex(user, refreshToken);
    if (tokenIndex < 0) {
      throw new AppError("Refresh token has been revoked or expired", 401, "REFRESH_REVOKED");
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
    const appError =
      error instanceof AppError ? error : new AppError("Refresh token is invalid", 401, "REFRESH_INVALID");

    if (["REFRESH_REQUIRED", "REFRESH_INVALID", "USER_NOT_FOUND", "REFRESH_REVOKED"].includes(appError.code || "")) {
      res.clearCookie(REFRESH_COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
    }

    next(appError);
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
    res.status(200).json({ success: true, message: "Signed out successfully" });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError("You must sign in to perform this action", 401, "AUTH_REQUIRED");
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError("User no longer exists", 401, "USER_NOT_FOUND");
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
      throw new AppError("Email is required", 400, "VALIDATION_ERROR");
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+passwordResetTokenHash +passwordResetExpires"
    );
    const resetToken = crypto.randomBytes(32).toString("hex");

    if (user) {
      user.passwordResetTokenHash = hashToken(resetToken);
      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetToken,
      });
    }

    res.status(200).json({
      success: true,
      message: "If this email exists, password reset instructions have been sent",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body as { token?: string; password?: string };
    if (!token || !password) {
      throw new AppError("Token and password are required", 400, "VALIDATION_ERROR");
    }

    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters", 400, "WEAK_PASSWORD");
    }

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password +refreshTokens +passwordResetTokenHash +passwordResetExpires");

    if (!user) {
      throw new AppError("Reset token is invalid or has expired", 400, "RESET_TOKEN_INVALID");
    }

    user.password = password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = [];
    await user.save();

    res.clearCookie(REFRESH_COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
    res.status(200).json({ success: true, message: "Password has been reset" });
  } catch (error) {
    next(error);
  }
};
