import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { TokenPayload } from "../modules/auth/auth.types.js";
import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";

// [AUTH] Extract bearer token
function getBearerToken(authHeader?: string): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
}

// [AUTH] Verify token safely
function tryVerifyToken(token?: string | null): TokenPayload | null {
  if (!token) return null;

  try {
    return verifyAccessToken(token) as TokenPayload;
  } catch {
    return null;
  }
}

// [MW] User authentication
export const authentication = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const bearerToken = getBearerToken(req.headers.authorization);
  const cookieToken = req.cookies?.accessToken ?? null;
  const decoded = tryVerifyToken(bearerToken) ?? tryVerifyToken(cookieToken);

  if (!decoded) {
    return next(new AppError("توکن شما معتبر نیست، لطفا ابتدا وارد شوید", 401));
  }

  try {
    // [DB] Load current user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isBanned: true,
      },
    });

    if (!user) {
      return next(new AppError("کاربر یافت نشد", 401));
    }

    if (user.isBanned) {
      return next(new AppError("حساب کاربری شما مسدود شده است", 403));
    }

    // [AUTH] Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};