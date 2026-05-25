import { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import { AppError } from "../utils/AppError";

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, "NOT_FOUND"));
};

export const errorHandler = (
  err: Error & {
    statusCode?: number;
    status?: number;
    code?: string | number;
    keyValue?: Record<string, unknown>;
    retryAfterSeconds?: number;
  },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal server error";
  let code = typeof err.code === "string" ? err.code : "INTERNAL_ERROR";

  if (err instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
    code = "VALIDATION_ERROR";
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field} already exists`;
    code = "DUPLICATE_VALUE";
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  if (statusCode === 429 && err.retryAfterSeconds) {
    res.setHeader("Retry-After", String(err.retryAfterSeconds));
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? "Server is temporarily unavailable" : message,
    code,
  });
};
