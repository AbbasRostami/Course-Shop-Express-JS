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
  const result = await authService.register(req.body);

  return res.status(201).json({
    status: "success",
    data: {
      email: result.email,
      message: result.message,
    },
  });
};

// [POST] Verify email OTP and auto-login
export const verifyEmailController: RequestHandler = async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.verifyEmail(
    req.body,
  );

  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: {
      message: "ورود با موفقیت انجام شد",
      accessToken,
      user,
    },
  });
};

// [POST] Login
export const loginController: RequestHandler = async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.login(req.body);

  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: {
      message: "ورود با موفقیت انجام شد",
      accessToken,
      user,
    },
  });
};

// [POST] Refresh access token
export const refreshController: RequestHandler = async (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    return next(new AppError("توکن نوسازی یافت نشد", 401));
  }

  const { accessToken, refreshToken } = await authService.refresh(token);

  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: {
      message: "تمدید موفق",
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
    data: { message: "خروج با موفقیت انجام شد" },
  });
};

// [POST] Forgot password
export const forgotPasswordController: RequestHandler = async (req, res) => {
  const result = await authService.forgotPassword(req.body);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

// [POST] Reset password and clear sessions
export const resetPasswordController: RequestHandler = async (req, res) => {
  const result = await authService.resetPassword(req.body);

  res.clearCookie("accessToken", CLEAR_COOKIE_OPTIONS);
  res.clearCookie("refreshToken", CLEAR_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

// [POST] Resend email verification code
export const resendVerificationController: RequestHandler = async (req, res) => {
  const result = await authService.resendVerification(req.body);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

// [POST] Resend password reset code
export const resendResetCodeController: RequestHandler = async (req, res) => {
  const result = await authService.resendResetCode(req.body);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

// [POST] Change password and clear sessions
export const changePasswordController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const result = await authService.changePassword(userId, req.body);

  res.clearCookie("accessToken", CLEAR_COOKIE_OPTIONS);
  res.clearCookie("refreshToken", CLEAR_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

// [POST] Request email change
export const requestChangeEmailController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const result = await authService.requestChangeEmail(userId, req.body);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

// [POST] Verify email change and clear sessions
export const verifyChangeEmailController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const result = await authService.verifyChangeEmail(userId, req.body);

  res.clearCookie("accessToken", CLEAR_COOKIE_OPTIONS);
  res.clearCookie("refreshToken", CLEAR_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

// [POST] Resend change email code
export const resendChangeEmailCodeController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const result = await authService.resendChangeEmailCode(userId);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};