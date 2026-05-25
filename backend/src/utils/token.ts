import crypto from "crypto";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { AuthUser } from "../types";

const getSecret = (name: "JWT_ACCESS_SECRET" | "JWT_REFRESH_SECRET", fallback: string): Secret => {
  const secret = process.env[name] || process.env.JWT_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} la bat buoc trong moi truong production`);
  }

  return fallback;
};

const accessSecret = (): Secret => getSecret("JWT_ACCESS_SECRET", "dev-access-secret");
const refreshSecret = (): Secret => getSecret("JWT_REFRESH_SECRET", "dev-refresh-secret");

const accessExpiresIn = (): SignOptions["expiresIn"] =>
  (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as SignOptions["expiresIn"];

const refreshExpiresIn = (): SignOptions["expiresIn"] =>
  (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

export const signAccessToken = (user: AuthUser) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    accessSecret(),
    { expiresIn: accessExpiresIn() }
  );

export const signRefreshToken = (user: AuthUser) =>
  jwt.sign(
    {
      sub: user.id,
      tokenId: crypto.randomUUID(),
    },
    refreshSecret(),
    { expiresIn: refreshExpiresIn() }
  );

export const verifyAccessToken = (token: string) => jwt.verify(token, accessSecret());

export const verifyRefreshToken = (token: string) => jwt.verify(token, refreshSecret());
