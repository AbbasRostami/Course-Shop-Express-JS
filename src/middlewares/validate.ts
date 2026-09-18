import type { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";
import { AppError } from "../utils/AppError.js";
import { removeCloudinaryImage } from "../utils/cloudinary.js";

// [UTIL] Recursively convert empty strings to undefined
const sanitizeEmptyStrings = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) return obj;

  const cleaned = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key in cleaned) {
    if (cleaned[key] === "") {
      cleaned[key] = undefined;
    } else if (typeof cleaned[key] === "object") {
      cleaned[key] = sanitizeEmptyStrings(cleaned[key]);
    }
  }

  return cleaned;
};

// [MW] Request validation
export const validate = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // [LOGIC] Convert empty strings to undefined to support optional form-data fields
      const sanitizedBody = sanitizeEmptyStrings(req.body);
      const sanitizedQuery = sanitizeEmptyStrings(req.query);
      const sanitizedParams = sanitizeEmptyStrings(req.params);

      const parsed = (await schema.parseAsync({
        body: sanitizedBody,
        query: sanitizedQuery,
        params: sanitizedParams,
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
            "common.validationError",
            400,
            formattedErrors,
          ),
        );
      }

      return next(error);
    }
  };
};