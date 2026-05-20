import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { auth } from "../middlewares/auth.middleware";
import { rateLimit, rateLimitKeys } from "../utils/rateLimit";

const router = Router();
const fifteenMinutesMs = 15 * 60 * 1000;

const forgotPasswordLimit = rateLimit({
  keyPrefix: "forgot-password",
  maxAttempts: 3,
  windowMs: fifteenMinutesMs,
  message: "Too many password reset requests. Please try again later",
  code: "FORGOT_PASSWORD_RATE_LIMITED",
  keyGenerator: rateLimitKeys.emailOrIp,
});

const forgotPasswordIpLimit = rateLimit({
  keyPrefix: "forgot-password-ip",
  maxAttempts: 3,
  windowMs: fifteenMinutesMs,
  message: "Too many password reset requests from this network. Please try again later",
  code: "FORGOT_PASSWORD_RATE_LIMITED",
  keyGenerator: rateLimitKeys.ip,
});

const resendVerificationLimit = rateLimit({
  keyPrefix: "resend-verification",
  maxAttempts: 3,
  windowMs: fifteenMinutesMs,
  message: "Too many verification email requests. Please try again later",
  code: "RESEND_VERIFICATION_RATE_LIMITED",
  keyGenerator: rateLimitKeys.emailOrIp,
});

const resendVerificationIpLimit = rateLimit({
  keyPrefix: "resend-verification-ip",
  maxAttempts: 3,
  windowMs: fifteenMinutesMs,
  message: "Too many verification email requests from this network. Please try again later",
  code: "RESEND_VERIFICATION_RATE_LIMITED",
  keyGenerator: rateLimitKeys.ip,
});

const verifyTokenAttemptLimit = rateLimit({
  keyPrefix: "verify-email-attempt",
  maxAttempts: 10,
  windowMs: fifteenMinutesMs,
  message: "Too many verification attempts. Please try again later",
  code: "VERIFY_EMAIL_RATE_LIMITED",
  keyGenerator: rateLimitKeys.ip,
});

const resetTokenAttemptLimit = rateLimit({
  keyPrefix: "reset-password-attempt",
  maxAttempts: 10,
  windowMs: fifteenMinutesMs,
  message: "Too many password reset attempts. Please try again later",
  code: "RESET_PASSWORD_RATE_LIMITED",
  keyGenerator: rateLimitKeys.ip,
});

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleLogin);
router.post("/verify-email", verifyTokenAttemptLimit, authController.verifyEmail);
router.post("/resend-verification", resendVerificationLimit, resendVerificationIpLimit, authController.resendVerificationEmail);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", auth, authController.me);
router.post("/forgot-password", forgotPasswordLimit, forgotPasswordIpLimit, authController.forgotPassword);
router.post("/reset-password", resetTokenAttemptLimit, authController.resetPassword);

export default router;
