import type { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { AppError } from "../utils/AppError.js";

// [AUTH] Role-based access
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("ابتدا باید وارد حساب کاربری خود شوید", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError("شما دسترسی لازم برای این عملیات را ندارید", 403),
      );
    }

    return next();
  };
};