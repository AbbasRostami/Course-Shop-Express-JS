import type { NextFunction, Request, RequestHandler, Response } from "express";

// [UTIL] Wrap async route handler with error forwarding
export const asyncHandler =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
  
// (fn: Function)
