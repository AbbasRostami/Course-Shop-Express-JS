import type { Request } from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import i18next from "i18next";

// [UTIL] Normalize IP
const getIp = (req: Request) => ipKeyGenerator(req.ip ?? "unknown");

// [UTIL] Normalize email
const getEmail = (req: Request) => {
  const email = req.body?.email;
  return typeof email === "string" ? email.trim().toLowerCase() : undefined;
};

// [UTIL] Get request locale
const getLocale = (req: Request): "fa" | "en" => {
  const lang = req.headers["accept-language"]?.split(",")[0]?.split("-")[0];
  return lang === "en" ? "en" : "fa";
};

// [UTIL] Translate fail response
const jsonMessage = (req: Request, key: string) => {
  const locale = getLocale(req);
  return {
    status: "fail",
    data: { 
      message: i18next.t(key as any, { lng: locale }) 
    },
  };
};

// [RATE] Login attempts
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = getEmail(req);
    const ip = getIp(req);
    return email ? `login:${ip}:${email}` : `login:${ip}`;
  },
  message: (req: Request) => jsonMessage(req, "auth.limiters.login"),
});

// [RATE] Register by IP
export const registerIpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => `register-ip:${getIp(req)}`,
  message: (req: Request) => jsonMessage(req, "auth.limiters.registerIp"),
});

// [RATE] Register by email
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = getEmail(req);
    const ip = getIp(req);
    return email ? `register:${ip}:${email}` : `register:${ip}`;
  },
  message: (req: Request) => jsonMessage(req, "auth.limiters.registerEmail"),
});

// [RATE] Forgot password
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = getEmail(req);
    const ip = getIp(req);
    return email ? `forgot-pwd:${ip}:${email}` : `forgot-pwd:${ip}`;
  },
  message: (req: Request) => jsonMessage(req, "auth.limiters.forgotPassword"),
});

// [RATE] Reset password
export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = getEmail(req);
    const ip = getIp(req);
    return email ? `reset-pwd:${ip}:${email}` : `reset-pwd:${ip}`;
  },
  message: (req: Request) => jsonMessage(req, "auth.limiters.resetPassword"),
});

// [RATE] Resend verify code
export const resendVerificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = getEmail(req);
    const ip = getIp(req);
    return email ? `resend-verify:${ip}:${email}` : `resend-verify:${ip}`;
  },
  message: (req: Request) => jsonMessage(req, "auth.limiters.resendVerify"),
});

// [RATE] Resend reset code
export const resendResetCodeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = getEmail(req);
    const ip = getIp(req);
    return email ? `resend-reset:${ip}:${email}` : `resend-reset:${ip}`;
  },
  message: (req: Request) => jsonMessage(req, "auth.limiters.resendReset"),
});

// [RATE] Change email
export const changeEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = getIp(req);
    const newEmail =
      typeof req.body?.newEmail === "string"
        ? req.body.newEmail.trim().toLowerCase()
        : undefined;

    return newEmail ? `change-email:${ip}:${newEmail}` : `change-email:${ip}`;
  },
  message: (req: Request) => jsonMessage(req, "auth.limiters.changeEmail"),
});

// [RATE] Resend change-email code
export const resendChangeEmailCodeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = getIp(req);
    return `resend-change-email:${ip}`;
  },
  message: (req: Request) => jsonMessage(req, "auth.limiters.resendChangeEmail"),
});