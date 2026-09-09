import { Role } from "../generated/prisma/enums.js";
import { TFunction } from "i18next";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
      };
      requestId?: string;
      locale: "fa" | "en";
      language: string;
      t: TFunction;
    }
  }
}

export {};