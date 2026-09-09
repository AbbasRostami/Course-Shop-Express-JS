import { RequestHandler } from "express";
import { AppError } from "../../utils/AppError.js";
import { authService } from "./auth.service.js";

// [CONFIG] Access token cookie options (15 min)
const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  path: "/",
  maxAge: 15 * 60 * 1000,
};

// [CONFIG] Refresh token cookie options (7 days)
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// [CONFIG] Cookie clear options
const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  path: "/",
};

// [POST] Register
export const registerController: RequestHandler = async (req, res) => {
  const result = await authService.register(
    req.body,
    req.language as "fa" | "en",
  );

  return res.status(201).json({
    status: "success",
    data: {
      email: result.email,
      message: req.t(result.message as any),
    },
  });
};

// [POST] Verify email OTP and auto-login
export const verifyEmailController: RequestHandler = async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.verifyEmail(
    req.body,
    req.language as "fa" | "en",
  );

  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t("auth.success.loginSuccess"),
      accessToken,
      user,
    },
  });
};

// [POST] Login
export const loginController: RequestHandler = async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.login(
    req.body,
    req.language as "fa" | "en",
  );

  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t("auth.success.loginSuccess"),
      accessToken,
      user,
    },
  });
};

// [POST] Refresh access token
export const refreshController: RequestHandler = async (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    return next(new AppError("auth.errors.refreshTokenNotFound", 401));
  }

  const { accessToken, refreshToken } = await authService.refresh(
    token,
    req.language as "fa" | "en",
  );

  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t("auth.success.refreshSuccess"),
      accessToken,
    },
  });
};

// [POST] Logout and clear cookies
export const logoutController: RequestHandler = async (req, res) => {
  const token =
    req.cookies?.refreshToken ??
    (req.headers["x-refresh-token"] as string | undefined) ??
    req.body?.refreshToken ??
    null;

  if (token) {
    await authService.logout(token);
  }

  res.clearCookie("accessToken", CLEAR_COOKIE_OPTIONS);
  res.clearCookie("refreshToken", CLEAR_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: { message: req.t("auth.success.logoutSuccess") },
  });
};

// [POST] Forgot password
export const forgotPasswordController: RequestHandler = async (req, res) => {
  const result = await authService.forgotPassword(
    req.body,
    req.language as "fa" | "en",
  );

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t(result.message as any),
    },
  });
};

// [POST] Reset password and clear sessions
export const resetPasswordController: RequestHandler = async (req, res) => {
  const result = await authService.resetPassword(
    req.body,
    req.language as "fa" | "en",
  );

  res.clearCookie("accessToken", CLEAR_COOKIE_OPTIONS);
  res.clearCookie("refreshToken", CLEAR_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t(result.message as any),
    },
  });
};

// [POST] Resend email verification code
export const resendVerificationController: RequestHandler = async (
  req,
  res,
) => {
  const result = await authService.resendVerification(
    req.body,
    req.language as "fa" | "en",
  );

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t(result.message as any),
    },
  });
};

// [POST] Resend password reset code
export const resendResetCodeController: RequestHandler = async (req, res) => {
  const result = await authService.resendResetCode(
    req.body,
    req.language as "fa" | "en",
  );

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t(result.message as any),
    },
  });
};

// [POST] Change password and clear sessions
export const changePasswordController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const result = await authService.changePassword(
    userId,
    req.body,
    req.language as "fa" | "en",
  );

  res.clearCookie("accessToken", CLEAR_COOKIE_OPTIONS);
  res.clearCookie("refreshToken", CLEAR_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t(result.message as any),
    },
  });
};

// [POST] Request email change
export const requestChangeEmailController: RequestHandler = async (
  req,
  res,
) => {
  const userId = req.user!.id;
  const result = await authService.requestChangeEmail(
    userId,
    req.body,
    req.language as "fa" | "en",
  );

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t(result.message as any),
      newEmail: result.newEmail,
    },
  });
};

// [POST] Verify email change and clear sessions
export const verifyChangeEmailController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const result = await authService.verifyChangeEmail(
    userId,
    req.body,
    req.language as "fa" | "en",
  );

  res.clearCookie("accessToken", CLEAR_COOKIE_OPTIONS);
  res.clearCookie("refreshToken", CLEAR_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t(result.message as any),
      newEmail: result.newEmail,
    },
  });
};

// [POST] Resend change email code
export const resendChangeEmailCodeController: RequestHandler = async (
  req,
  res,
) => {
  const userId = req.user!.id;
  const result = await authService.resendChangeEmailCode(
    userId,
    req.language as "fa" | "en",
  );

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t(result.message as any),
      newEmail: result.newEmail,
    },
  });
};
