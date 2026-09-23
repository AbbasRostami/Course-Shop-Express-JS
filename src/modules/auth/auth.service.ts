import i18next from "i18next";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { sendEmail } from "../../utils/email.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import {
  getChangeEmailTemplate,
  getResetPasswordEmailTemplate,
  getVerificationEmailTemplate,
} from "./auth.templates.js";
import { AuthResponse } from "./auth.types.js";
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  RequestChangeEmailInput,
  ResendResetCodeInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyChangeEmailInput,
  VerifyEmailInput,
} from "./auth.validator.js";

// [CONFIG] OTP expiry duration
const OTP_EXPIRES_MS = 2 * 60 * 1000;

// [UTIL] Generate 6-digit OTP
const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// [UTIL] Get OTP expiry date
const getOtpExpiresAt = () => new Date(Date.now() + OTP_EXPIRES_MS);

export const authService = {
  // [AUTH] Register new user or resend OTP
  async register(data: RegisterInput, locale: "fa" | "en") {
    const t = i18next.getFixedT(locale);
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        throw new AppError("auth.errors.emailExists", 400, {
          email: "auth.errors.emailExists",
        });
      }

      if (existingUser.isBanned) {
        throw new AppError("auth.errors.accountBanned", 403);
      }

      // [LOGIC] Block if previous OTP still valid
      if (
        existingUser.verificationCode &&
        existingUser.verificationExpires &&
        existingUser.verificationExpires > new Date()
      ) {
        throw new AppError("auth.errors.registerError", 400, {
          email: "auth.errors.otpStillValid",
        });
      }

      // [DB] Update unverified user and resend OTP
      const hashedPassword = await hashPassword(data.password);
      const verificationCode = generateCode();
      const verificationExpires = getOtpExpiresAt();

      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          name: data.name ?? existingUser.name,
          verificationCode,
          verificationExpires,
        },
      });

      const emailHtml = getVerificationEmailTemplate(
        updatedUser.name || t("auth.email.dearUser"),
        verificationCode,
        locale,
      );

      try {
        await sendEmail({
          to: updatedUser.email,
          subject: t("auth.email.verificationSubject"),
          html: emailHtml,
          text: t("auth.email.verificationText", { code: verificationCode }),
        });
      } catch (err) {
        console.error("❌ Error sending verification email:", err);
        throw new AppError("auth.errors.emailSendFailed", 500);
      }

      return {
        email: updatedUser.email,
        message: "auth.success.otpResent",
      };
    }

    // [DB] Create new user with wallet
    const hashedPassword = await hashPassword(data.password);
    const verificationCode = generateCode();
    const verificationExpires = getOtpExpiresAt();

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        verificationCode,
        verificationExpires,
        wallet: {
          create: { balance: 0 },
        },
      },
    });

    const emailHtml = getVerificationEmailTemplate(
      user.name || t("auth.email.dearUser"),
      verificationCode,
      locale,
    );

    try {
      await sendEmail({
        to: user.email,
        subject: t("auth.email.verificationSubject"),
        html: emailHtml,
        text: t("auth.email.verificationText", { code: verificationCode }),
      });
    } catch (err) {
      console.error("❌ Error sending verification email:", err);
      // [CLEANUP] Rollback user on email failure
      await prisma.user.delete({ where: { id: user.id } });
      throw new AppError("auth.errors.emailSendFailed", 500);
    }

    return {
      email: user.email,
      message: "auth.success.otpSent",
    };
  },

  // [AUTH] Verify OTP and auto-login
  async verifyEmail(
    data: VerifyEmailInput,
    locale: "fa" | "en",
  ): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user || !user.verificationCode || !user.verificationExpires) {
      throw new AppError("auth.errors.invalidOtp", 400, {
        code: "auth.errors.invalidOtp",
      });
    }

    if (user.verificationExpires < new Date()) {
      throw new AppError("auth.errors.expiredOtp", 400, {
        code: "auth.errors.expiredOtp",
      });
    }

    if (user.verificationCode !== data.code) {
      throw new AppError("auth.errors.invalidOtp", 400);
    }

    if (user.isBanned) {
      throw new AppError("auth.errors.accountBanned", 403);
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id });

    // [DB] Mark user as verified and store refresh token
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationExpires: null,
        refreshToken,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    };
  },

  // [AUTH] Login with email and password
  async login(data: LoginInput, locale: "fa" | "en"): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new AppError("auth.errors.invalidCredentials", 401);
    }

    if (!user.isVerified) {
      throw new AppError("auth.errors.notVerified", 403);
    }

    if (user.isBanned) {
      throw new AppError("auth.errors.accountBanned", 403);
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw new AppError("auth.errors.invalidCredentials", 401);
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id });

    // [DB] Store new refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },

  // [AUTH] Rotate refresh token
  async refresh(token: string, locale: "fa" | "en") {
    try {
      const decoded = verifyRefreshToken(token) as { id: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      // [AUTH] Revoke token if mismatch (token reuse detected)
      if (!user || user.refreshToken !== token) {
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: null },
          });
        }
        throw new AppError("auth.errors.invalidRefreshToken", 401);
      }

      if (user.isBanned) {
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: null },
        });
        throw new AppError("auth.errors.accountBanned", 403);
      }

      const newAccessToken = generateAccessToken({
        id: user.id,
        email: user.email,
      });
      const newRefreshToken = generateRefreshToken({ id: user.id });

      // [DB] Store rotated refresh token
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("auth.errors.sessionExpired", 401);
    }
  },

  // [AUTH] Invalidate refresh token on logout
  async logout(token: string) {
    try {
      const decoded = verifyRefreshToken(token) as { id: string };
      await prisma.user.update({
        where: { id: decoded.id },
        data: { refreshToken: null },
      });
    } catch {}
  },

  // [AUTH] Send password reset OTP
  async forgotPassword(data: ForgotPasswordInput, locale: "fa" | "en") {
    const t = i18next.getFixedT(locale);
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // [SECURITY] Generic message to prevent email enumeration
    const genericMessage = {
      message: "auth.success.resetEmailSent",
    };

    if (!user || !user.isVerified) {
      return genericMessage;
    }

    const resetCode = generateCode();
    const resetExpires = getOtpExpiresAt();

    // [DB] Store reset code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordCode: resetCode,
        resetPasswordExpires: resetExpires,
      },
    });

    const emailHtml = getResetPasswordEmailTemplate(
      user.name || t("auth.email.dearUser"),
      resetCode,
      locale,
    );

    // [EMAIL] Send async, don't block response
    sendEmail({
      to: user.email,
      subject: t("auth.email.resetSubject"),
      html: emailHtml,
      text: t("auth.email.resetText", { code: resetCode }),
    }).catch((err) => console.error("❌ Error sending reset email:", err));

    return genericMessage;
  },

  // [AUTH] Reset password with OTP code
  async resetPassword(data: ResetPasswordInput, locale: "fa" | "en") {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
      throw new AppError("auth.errors.invalidResetRequest", 400, {
        code: "auth.errors.invalidResetRequest",
      });
    }

    if (user.resetPasswordExpires < new Date()) {
      // [DB] Clear expired reset code
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordCode: null,
          resetPasswordExpires: null,
        },
      });

      throw new AppError("auth.errors.expiredResetCode", 400, {
        code: "auth.errors.expiredResetCode",
      });
    }

    if (user.resetPasswordCode !== data.code) {
      throw new AppError("auth.errors.incorrectResetCode", 400, {
        code: "auth.errors.incorrectResetCode",
      });
    }

    const hashedPassword = await hashPassword(data.newPassword);

    // [DB] Update password and invalidate all sessions
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordCode: null,
        resetPasswordExpires: null,
        refreshToken: null,
      },
    });

    return {
      message: "auth.success.passwordResetSuccess",
    };
  },

  // [AUTH] Resend email verification OTP
  async resendVerification(data: ResendVerificationInput, locale: "fa" | "en") {
    const t = i18next.getFixedT(locale);
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // [SECURITY] Generic message to prevent email enumeration
    const genericMessage = {
      message: "auth.success.verificationResent",
    };

    if (!user || user.isVerified) {
      return genericMessage;
    }

    const verificationCode = generateCode();
    const verificationExpires = getOtpExpiresAt();

    // [DB] Store new OTP
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode, verificationExpires },
    });

    const emailHtml = getVerificationEmailTemplate(
      user.name || t("auth.email.dearUser"),
      verificationCode,
      locale,
    );

    // [EMAIL] Send async, don't block response
    sendEmail({
      to: user.email,
      subject: t("auth.email.verificationSubject"),
      html: emailHtml,
      text: t("auth.email.verificationText", { code: verificationCode }),
    }).catch((err) => console.error("❌ Error sending email:", err));

    return genericMessage;
  },

  // [AUTH] Resend password reset OTP
  async resendResetCode(data: ResendResetCodeInput, locale: "fa" | "en") {
    const t = i18next.getFixedT(locale);
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // [SECURITY] Generic message to prevent email enumeration
    const genericMessage = {
      message: "auth.success.otpResent",
    };

    if (!user || !user.isVerified) {
      return genericMessage;
    }

    // [LOGIC] Only resend if prior forgot-password request exists
    if (!user.resetPasswordCode) {
      return genericMessage;
    }

    const resetCode = generateCode();
    const resetExpires = getOtpExpiresAt();

    // [DB] Store new reset OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordCode: resetCode,
        resetPasswordExpires: resetExpires,
      },
    });

    const emailHtml = getResetPasswordEmailTemplate(
      user.name || t("auth.email.dearUser"),
      resetCode,
      locale,
    );

    // [EMAIL] Send async, don't block response
    sendEmail({
      to: user.email,
      subject: t("auth.email.resetSubject"),
      html: emailHtml,
      text: t("auth.email.resetText", { code: resetCode }),
    }).catch((err) => console.error("❌ Error sending reset email:", err));

    return genericMessage;
  },

  // [AUTH] Change password for authenticated user
  async changePassword(
    userId: string,
    data: ChangePasswordInput,
    locale: "fa" | "en",
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("auth.errors.userNotFound", 404);
    }

    const isMatch = await comparePassword(data.currentPassword, user.password);
    if (!isMatch) {
      throw new AppError("auth.errors.currentPasswordIncorrect", 400, {
        currentPassword: "auth.errors.currentPasswordIncorrect",
      });
    }

    const hashedPassword = await hashPassword(data.newPassword);

    // [DB] Update password and invalidate all sessions
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        refreshToken: null,
      },
    });

    return {
      message: "auth.success.passwordChanged",
    };
  },

  // [AUTH] Request email change - send OTP to new email
  async requestChangeEmail(
    userId: string,
    data: RequestChangeEmailInput,
    locale: "fa" | "en",
  ) {
    const t = i18next.getFixedT(locale);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("auth.errors.userNotFound", 404);
    }

    if (user.email === data.newEmail.toLowerCase()) {
      throw new AppError("auth.errors.sameEmail", 400, {
        newEmail: "auth.errors.sameEmail",
      });
    }

    // [DB] Check if new email is taken
    const existingUser = await prisma.user.findUnique({
      where: { email: data.newEmail.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError("auth.errors.emailTaken", 400, {
        newEmail: "auth.errors.emailTaken",
      });
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw new AppError("auth.errors.passwordIncorrect", 400, {
        password: "auth.errors.passwordIncorrect",
      });
    }

    const code = generateCode();
    const expires = getOtpExpiresAt();

    // [DB] Store pending email change
    await prisma.user.update({
      where: { id: userId },
      data: {
        pendingNewEmail: data.newEmail.toLowerCase(),
        changeEmailCode: code,
        changeEmailExpires: expires,
      },
    });

    const emailHtml = getChangeEmailTemplate(
      user.name || t("auth.email.dearUser"),
      data.newEmail,
      code,
      locale,
    );

    // [EMAIL] Send OTP to new email
    sendEmail({
      to: data.newEmail,
      subject: t("auth.email.changeEmailSubject"),
      html: emailHtml,
      text: t("auth.email.changeEmailText", { code }),
    }).catch((err) => console.error("❌ Error sending change email:", err));

    return {
      message: "auth.success.changeEmailOtpSent",
      newEmail: data.newEmail,
    };
  },

  // [AUTH] Verify OTP and apply new email
  async verifyChangeEmail(
    userId: string,
    data: VerifyChangeEmailInput,
    locale: "fa" | "en",
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("auth.errors.userNotFound", 404);
    }

    if (
      !user.pendingNewEmail ||
      !user.changeEmailCode ||
      !user.changeEmailExpires
    ) {
      throw new AppError("auth.errors.invalidEmailChangeRequest", 400, {
        code: "auth.errors.requestEmailChangeFirst",
      });
    }

    if (user.changeEmailExpires < new Date()) {
      // [DB] Clear expired change email request
      await prisma.user.update({
        where: { id: userId },
        data: {
          pendingNewEmail: null,
          changeEmailCode: null,
          changeEmailExpires: null,
        },
      });

      throw new AppError("auth.errors.expiredCode", 400, {
        code: "auth.errors.expiredCode",
      });
    }

    if (user.changeEmailCode !== data.code) {
      throw new AppError("auth.errors.invalidOtp", 400, {
        code: "auth.errors.invalidOtp",
      });
    }

    // [DB] Race condition check - email taken during process
    const existingUser = await prisma.user.findUnique({
      where: { email: user.pendingNewEmail },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          pendingNewEmail: null,
          changeEmailCode: null,
          changeEmailExpires: null,
        },
      });

      throw new AppError("auth.errors.emailTakenDuringProcess", 400);
    }

    // [DB] Apply new email and invalidate all sessions
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: user.pendingNewEmail,
        pendingNewEmail: null,
        changeEmailCode: null,
        changeEmailExpires: null,
        refreshToken: null,
      },
    });

    return {
      message: "auth.success.emailChangedSuccess",
      newEmail: user.pendingNewEmail,
    };
  },

  // [AUTH] Resend change email OTP
  async resendChangeEmailCode(userId: string, locale: "fa" | "en") {
    const t = i18next.getFixedT(locale);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("auth.errors.userNotFound", 404);
    }

    if (!user.pendingNewEmail) {
      throw new AppError("auth.errors.requestEmailChangeFirst", 400);
    }

    const code = generateCode();
    const expires = getOtpExpiresAt();

    // [DB] Store new OTP
    await prisma.user.update({
      where: { id: userId },
      data: {
        changeEmailCode: code,
        changeEmailExpires: expires,
      },
    });

    const emailHtml = getChangeEmailTemplate(
      user.name || t("auth.email.dearUser"),
      user.pendingNewEmail,
      code,
      locale,
    );

    // [EMAIL] Resend OTP to pending new email
    sendEmail({
      to: user.pendingNewEmail,
      subject: t("auth.email.changeEmailSubject"),
      html: emailHtml,
      text: t("auth.email.changeEmailText", { code }),
    }).catch((err) => console.error("❌ Error sending change email:", err));

    return {
      message: "auth.success.changeEmailCodeResent",
      newEmail: user.pendingNewEmail,
    };
  },
};
