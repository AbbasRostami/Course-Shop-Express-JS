import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/AppError.js";
import { logger, sendErrorToTelegram } from "./logger.js";

// [MW] Global error handler
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // [ALERT] Telegram notifier
  const notifyTelegram = (
    statusCode: number,
    message: string,
    stack?: string,
  ) => {
    sendErrorToTelegram({
      statusCode,
      method: req.method,
      path: req.originalUrl,
      message,
      stack,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    }).catch(() => {});
  };

  // [ERROR] Handle AppError
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error("💥 Server Error", {
        message: err.message,
        stack: err.stack,
        method: req.method,
        path: req.originalUrl,
      });
      notifyTelegram(err.statusCode, err.message, err.stack);
    }

    if (err.status === "fail") {
      return res.status(err.statusCode).json({
        status: "fail",
        data: err.failData || { message: err.message },
      });
    }

    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      code: err.statusCode,
    });
  }

  // [ERROR] Handle unexpected errors
  logger.error("💥 Unexpected Error", {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.originalUrl,
  });

  notifyTelegram(500, err.message || "Unknown error", err.stack);

  return res.status(500).json({
    status: "error",
    message: "خطایی در سمت سرور رخ داده است. لطفاً بعداً تلاش کنید.",
    code: 500,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
