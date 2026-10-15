import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/client.js";
import { AppError } from "../utils/AppError.js";

// [AUTH] Core: Role-based access control
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("auth.errors.unauthorized", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      if (allowedRoles.length === 1 && allowedRoles[0] === "SUPER_ADMIN") {
        return next(new AppError("auth.errors.forbiddenSuperAdmin", 403));
      }
      return next(new AppError("auth.errors.forbidden", 403));
    }

    return next();
  };
};

// [AUTH] Shortcut: Any admin role (view-only access included)
export const authorizeAdmins = () => authorize("ADMIN", "SUPER_ADMIN");

// [AUTH] Shortcut: Only SUPER_ADMIN (destructive actions)
export const authorizeSuperAdmin = () => authorize("SUPER_ADMIN");
