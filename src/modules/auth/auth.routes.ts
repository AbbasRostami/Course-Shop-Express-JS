import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import {
  changeEmailLimiter,
  forgotPasswordLimiter,
  loginLimiter,
  registerIpLimiter,
  registerLimiter,
  resendChangeEmailCodeLimiter,
  resendResetCodeLimiter,
  resendVerificationLimiter,
  resetPasswordLimiter,
} from "../../middlewares/authLimiter.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  changePasswordController,
  forgotPasswordController,
  loginController,
  logoutController,
  refreshController,
  registerController,
  requestChangeEmailController,
  resendChangeEmailCodeController,
  resendResetCodeController,
  resendVerificationController,
  resetPasswordController,
  verifyChangeEmailController,
  verifyEmailController,
} from "./auth.controller.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  requestChangeEmailSchema,
  resendResetCodeSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyChangeEmailSchema,
  verifyEmailSchema,
} from "./auth.validator.js";

const router = Router();

// [POST] Register
router.post(
  "/register",
  registerIpLimiter,
  registerLimiter,
  validate(registerSchema),
  asyncHandler(registerController),
);

// [POST] Verify email OTP
router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  asyncHandler(verifyEmailController),
);

// [POST] Login
router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  asyncHandler(loginController),
);

// [POST] Refresh token
router.post("/refresh", asyncHandler(refreshController));

// [POST] Logout
router.post("/logout", asyncHandler(logoutController));

// [POST] Forgot password
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(forgotPasswordController),
);

// [POST] Reset password
router.post(
  "/reset-password",
  resetPasswordLimiter,
  validate(resetPasswordSchema),
  asyncHandler(resetPasswordController),
);

// [POST] Resend verification OTP
router.post(
  "/resend-verification",
  resendVerificationLimiter,
  validate(resendVerificationSchema),
  asyncHandler(resendVerificationController),
);

// [POST] Resend reset code
router.post(
  "/resend-reset-code",
  resendResetCodeLimiter,
  validate(resendResetCodeSchema),
  asyncHandler(resendResetCodeController),
);

// [POST] Change password (auth required)
router.post(
  "/change-password",
  authentication,
  validate(changePasswordSchema),
  asyncHandler(changePasswordController),
);

// [POST] Request email change (auth required)
router.post(
  "/request-change-email",
  authentication,
  changeEmailLimiter,
  validate(requestChangeEmailSchema),
  asyncHandler(requestChangeEmailController),
);

// [POST] Verify email change (auth required)
router.post(
  "/verify-change-email",
  authentication,
  validate(verifyChangeEmailSchema),
  asyncHandler(verifyChangeEmailController),
);

// [POST] Resend change email code (auth required)
router.post(
  "/resend-change-email-code",
  authentication,
  resendChangeEmailCodeLimiter,
  asyncHandler(resendChangeEmailCodeController),
);

export default router;
