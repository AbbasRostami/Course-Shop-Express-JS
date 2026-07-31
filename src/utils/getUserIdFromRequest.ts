import type { Request } from "express";
import { TokenPayload } from "../modules/auth/auth.types.js";
import { verifyAccessToken } from "./jwt.js";

// [AUTH] Extract user ID from cookie or bearer token
export const getUserIdFromRequest = (req: Request): string | undefined => {
  let token = req.cookies?.accessToken;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return undefined;

  try {
    const decoded = verifyAccessToken(token) as TokenPayload;
    return decoded.id;
  } catch {
    return undefined;
  }
};