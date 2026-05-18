import { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import { AppError } from "../utils/AppError";

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Khong tim thay route ${req.method} ${req.originalUrl}`, 404, "NOT_FOUND"));
};

export const errorHandler = (
  err: Error & { statusCode?: number; code?: string | number; keyValue?: Record<string, unknown> },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
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
    message = `${field} da ton tai`;
    code = "DUPLICATE_VALUE";
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? "May chu tam thoi khong kha dung" : message,
    code,
  });
};
