import type { Request } from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";

// [UTIL] Normalize IP
const getIp = (req: Request) => ipKeyGenerator(req.ip ?? "unknown");

// [UTIL] Normalize email
const getEmail = (req: Request) => {
  const email = req.body?.email;
  return typeof email === "string" ? email.trim().toLowerCase() : undefined;
};

// [UTIL] Fail response
const jsonMessage = (message: string) => ({
  status: "fail",
  data: { message },
});

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
  message: jsonMessage(
    "تعداد تلاش‌های ناموفق برای ورود بیش از حد مجاز است. لطفاً 15 دقیقه دیگر تلاش کنید.",
  ),
});

// [RATE] Register by IP
export const registerIpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => `register-ip:${getIp(req)}`,
  message: jsonMessage(
    "تعداد درخواست‌های ثبت‌نام از این IP بیش از حد مجاز است. لطفاً 1 ساعت دیگر تلاش کنید.",
  ),
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
  message: jsonMessage(
    "تعداد درخواست‌های ثبت‌نام برای این ایمیل بیش از حد مجاز است. لطفاً 1 ساعت دیگر تلاش کنید.",
  ),
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
  message: jsonMessage(
    "تعداد درخواست‌های بازیابی رمز عبور بیش از حد مجاز است. لطفاً 1 ساعت دیگر تلاش کنید.",
  ),
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
  message: jsonMessage(
    "تعداد تلاش‌های ناموفق برای بازیابی رمز بیش از حد مجاز است. لطفاً 15 دقیقه دیگر تلاش کنید.",
  ),
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
  message: jsonMessage(
    "تعداد درخواست‌های ارسال مجدد کد تایید بیش از حد مجاز است. لطفاً 5 دقیقه دیگر تلاش کنید.",
  ),
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
  message: jsonMessage(
    "تعداد درخواست‌های ارسال مجدد کد بازیابی بیش از حد مجاز است. لطفاً 5 دقیقه دیگر تلاش کنید.",
  ),
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
  message: jsonMessage(
    "تعداد درخواست‌های تغییر ایمیل بیش از حد مجاز است. لطفاً 1 ساعت دیگر تلاش کنید.",
  ),
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
  message: jsonMessage(
    "تعداد درخواست‌های ارسال مجدد کد تغییر ایمیل بیش از حد مجاز است. لطفاً 5 دقیقه دیگر تلاش کنید.",
  ),
});