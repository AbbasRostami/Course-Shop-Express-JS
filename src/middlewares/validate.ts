import type { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";
import { AppError } from "../utils/AppError.js";
import { removeCloudinaryImage } from "../utils/cloudinary.js";

// [MW] Request validation
export const validate = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };

      // [LOGIC] Apply parsed values
      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }

      if (parsed.query !== undefined) {
        Object.assign(req.query, parsed.query);
      }

      if (parsed.params !== undefined) {
        Object.assign(req.params, parsed.params);
      }

      return next();
    } catch (error) {
      // [CLEANUP] Remove uploaded file on fail
      if (req.file?.path) {
        await removeCloudinaryImage(req.file.path);
      }

      // [ERROR] Format zod errors
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string> = {};

        error.issues.forEach((issue) => {
          const rawField = issue.path[1] ?? issue.path[0];
          if (rawField !== undefined) {
            const fieldName = String(rawField);
            formattedErrors[fieldName] = issue.message;
          }
        });

        return next(
          new AppError(
            "خطا در اعتبارسنجی داده‌های ورودی",
            400,
            formattedErrors,
          ),
        );
      }

      return next(error);
    }
  };
};
