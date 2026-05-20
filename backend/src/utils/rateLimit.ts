import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { AppError } from "./AppError";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  keyPrefix: string;
  maxAttempts: number;
  windowMs: number;
  message: string;
  code: string;
  keyGenerator: (req: Request) => string | undefined;
};

const buckets = new Map<string, RateLimitEntry>();

const now = () => Date.now();

const getClientIp = (req: Request) => req.ip || req.socket.remoteAddress || "unknown";

const normalizeEmail = (email: unknown) => (typeof email === "string" ? email.trim().toLowerCase() : "");

const hashKeyPart = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

const getEntry = (key: string, windowMs: number) => {
  const currentTime = now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= currentTime) {
    const freshEntry = { count: 0, resetAt: currentTime + windowMs };
    buckets.set(key, freshEntry);
    return freshEntry;
  }

  return existing;
};

const createRateLimitError = (entry: RateLimitEntry, message: string, code: string) => {
  const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now()) / 1000));
  const error = new AppError(message, 429, code) as AppError & { retryAfterSeconds?: number };
  error.retryAfterSeconds = retryAfterSeconds;
  return error;
};

export const rateLimitKeys = {
  ip: getClientIp,
  emailOrIp: (req: Request) => {
    const email = normalizeEmail(req.body?.email);
    return email ? `email:${hashKeyPart(email)}` : `ip:${getClientIp(req)}`;
  },
  tokenOrIp: (req: Request) => {
    const token = typeof req.body?.token === "string" ? req.body.token : "";
    return token ? `token:${hashKeyPart(token)}` : `ip:${getClientIp(req)}`;
  },
  emailAndIp: (req: Request) => {
    const email = normalizeEmail(req.body?.email);
    return email ? `email:${hashKeyPart(email)}:ip:${getClientIp(req)}` : `ip:${getClientIp(req)}`;
  },
};

export const assertRateLimit = (key: string, maxAttempts: number, windowMs: number, message: string, code: string) => {
  const entry = getEntry(key, windowMs);

  if (entry.count >= maxAttempts) {
    throw createRateLimitError(entry, message, code);
  }
};

export const hitRateLimit = (key: string, maxAttempts: number, windowMs: number, message: string, code: string) => {
  const entry = getEntry(key, windowMs);
  entry.count += 1;

  if (entry.count > maxAttempts) {
    throw createRateLimitError(entry, message, code);
  }
};

export const resetRateLimit = (key: string) => {
  buckets.delete(key);
};

export const rateLimit = ({ keyPrefix, maxAttempts, windowMs, message, code, keyGenerator }: RateLimitOptions) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const keyPart = keyGenerator(req);
      if (!keyPart) {
        return next();
      }

      hitRateLimit(`${keyPrefix}:${keyPart}`, maxAttempts, windowMs, message, code);
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

