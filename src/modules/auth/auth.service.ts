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
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        throw new AppError("خطا در ثبت نام", 400, {
          email: "کاربری با این ایمیل قبلاً ثبت‌ نام کرده است",
        });
      }

      if (existingUser.isBanned) {
        throw new AppError("این حساب کاربری مسدود شده است", 403);
      }

      // [LOGIC] Block if previous OTP still valid
      if (
        existingUser.verificationCode &&
        existingUser.verificationExpires &&
        existingUser.verificationExpires > new Date()
      ) {
        throw new AppError("خطا در ثبت نام", 400, {
          email:
            "کد تایید قبلی هنوز معتبر است. لطفاً ایمیل خود را بررسی کنید یا از گزینه «ارسال مجدد کد» استفاده کنید",
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
        updatedUser.name || "کاربر گرامی",
        verificationCode,
      );

      try {
        await sendEmail({
          to: updatedUser.email,
          subject: "🔑 کد تایید حساب کاربری",
          html: emailHtml,
          text: `کد تایید شما: ${verificationCode}`,
        });
      } catch (err) {
        console.error("❌ Error sending verification email:", err);
        throw new AppError(
          "ارسال ایمیل تایید ناموفق بود. لطفاً دوباره تلاش کنید.",
          500,
        );
      }

      return {
        email: updatedUser.email,
        message: "کد تایید جدید به ایمیل شما ارسال شد",
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
      user.name || "کاربر گرامی",
      verificationCode,
    );

    try {
      await sendEmail({
        to: user.email,
        subject: "🔑 کد تایید حساب کاربری",
        html: emailHtml,
        text: `کد تایید شما: ${verificationCode}`,
      });
    } catch (err) {
      console.error("❌ Error sending verification email:", err);
      // [CLEANUP] Rollback user on email failure
      await prisma.user.delete({ where: { id: user.id } });
      throw new AppError(
        "ارسال ایمیل تایید ناموفق بود. لطفاً دوباره تلاش کنید.",
        500,
      );
    }

    return {
      email: user.email,
      message: "کد تایید به ایمیل شما ارسال شد",
    };
  },

  // [AUTH] Verify OTP and auto-login
  async verifyEmail(data: VerifyEmailInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user || !user.verificationCode || !user.verificationExpires) {
      throw new AppError("خطا در تایید ایمیل", 400, {
        code: "کد تایید اشتباه است",
      });
    }

    if (user.verificationExpires < new Date()) {
      throw new AppError("خطا در تایید ایمیل", 400, {
        code: "کد تایید منقضی شده است، لطفاً مجدداً ثبت‌نام کنید",
      });
    }

    if (user.verificationCode !== data.code) {
      throw new AppError("کد تایید اشتباه است", 400);
    }

    if (user.isBanned) {
      throw new AppError("حساب کاربری شما مسدود شده است", 403);
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
      },
    };
  },

  // [AUTH] Login with email and password
  async login(data: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new AppError("ایمیل یا رمز عبور اشتباه است", 401);
    }

    if (!user.isVerified) {
      throw new AppError(
        "حساب کاربری شما هنوز تایید نشده است. ابتدا ایمیل خود را تایید کنید",
        403,
      );
    }

    if (user.isBanned) {
      throw new AppError("حساب کاربری شما مسدود شده است", 403);
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw new AppError("ایمیل یا رمز عبور اشتباه است", 401);
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
      user: { id: user.id, email: user.email, name: user.name },
    };
  },

  // [AUTH] Rotate refresh token
  async refresh(token: string) {
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
        throw new AppError("توکن نوسازی نامعتبر یا منقضی شده است", 401);
      }

      if (user.isBanned) {
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: null },
        });
        throw new AppError("حساب کاربری شما مسدود شده است", 403);
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
      throw new AppError("نشست شما منقضی شده است، لطفا دوباره وارد شوید", 401);
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
  async forgotPassword(data: ForgotPasswordInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // [SECURITY] Generic message to prevent email enumeration
    const genericMessage = {
      message: "اگر این ایمیل در سیستم وجود داشته باشد، کد بازیابی ارسال شد",
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
      user.name || "کاربر گرامی",
      resetCode,
    );

    // [EMAIL] Send async, don't block response
    sendEmail({
      to: user.email,
      subject: "🔐 بازیابی رمز عبور",
      html: emailHtml,
      text: `کد بازیابی: ${resetCode}`,
    }).catch((err) => console.error("❌ Error sending reset email:", err));

    return genericMessage;
  },

  // [AUTH] Reset password with OTP code
  async resetPassword(data: ResetPasswordInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
      throw new AppError("درخواست بازیابی معتبر نیست", 400, {
        code: "ابتدا درخواست بازیابی رمز عبور دهید",
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

      throw new AppError("کد بازیابی منقضی شده است", 400, {
        code: "کد منقضی شده است، دوباره درخواست دهید",
      });
    }

    if (user.resetPasswordCode !== data.code) {
      throw new AppError("کد بازیابی اشتباه است", 400, {
        code: "کد وارد شده صحیح نیست",
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
      message: "رمز عبور شما با موفقیت تغییر یافت. لطفاً مجدداً وارد شوید",
    };
  },

  // [AUTH] Resend email verification OTP
  async resendVerification(data: ResendVerificationInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // [SECURITY] Generic message to prevent email enumeration
    const genericMessage = {
      message: "کد تایید مجدداً به ایمیل ارسال شد",
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
      user.name || "کاربر گرامی",
      verificationCode,
    );

    // [EMAIL] Send async, don't block response
    sendEmail({
      to: user.email,
      subject: "🔑 کد تایید حساب کاربری",
      html: emailHtml,
      text: `کد تایید شما: ${verificationCode}`,
    }).catch((err) => console.error("❌ Error sending email:", err));

    return genericMessage;
  },

  // [AUTH] Resend password reset OTP
  async resendResetCode(data: ResendResetCodeInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // [SECURITY] Generic message to prevent email enumeration
    const genericMessage = {
      message: "کد تایید مجدداً به ایمیل ارسال شد",
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
      user.name || "کاربر گرامی",
      resetCode,
    );

    // [EMAIL] Send async, don't block response
    sendEmail({
      to: user.email,
      subject: "🔐 بازیابی رمز عبور",
      html: emailHtml,
      text: `کد بازیابی: ${resetCode}`,
    }).catch((err) => console.error("❌ Error sending reset email:", err));

    return genericMessage;
  },

  // [AUTH] Change password for authenticated user
  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("کاربر یافت نشد", 404);
    }

    const isMatch = await comparePassword(data.currentPassword, user.password);
    if (!isMatch) {
      throw new AppError("رمز عبور فعلی اشتباه است", 400, {
        currentPassword: "رمز عبور فعلی صحیح نیست",
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
      message: "رمز عبور با موفقیت تغییر یافت. لطفاً مجدداً وارد شوید",
    };
  },

  // [AUTH] Request email change - send OTP to new email
  async requestChangeEmail(userId: string, data: RequestChangeEmailInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("کاربر یافت نشد", 404);
    }

    if (user.email === data.newEmail.toLowerCase()) {
      throw new AppError("ایمیل جدید نمی‌تواند با ایمیل فعلی یکسان باشد", 400, {
        newEmail: "ایمیل جدید همان ایمیل فعلی است",
      });
    }

    // [DB] Check if new email is taken
    const existingUser = await prisma.user.findUnique({
      where: { email: data.newEmail.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError("این ایمیل قبلاً استفاده شده است", 400, {
        newEmail: "کاربر دیگری با این ایمیل ثبت‌نام کرده است",
      });
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw new AppError("رمز عبور اشتباه است", 400, {
        password: "رمز عبور صحیح نیست",
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
      user.name || "کاربر گرامی",
      data.newEmail,
      code,
    );

    // [EMAIL] Send OTP to new email
    sendEmail({
      to: data.newEmail,
      subject: "📧 تایید تغییر ایمیل",
      html: emailHtml,
      text: `کد تایید: ${code}`,
    }).catch((err) => console.error("❌ Error sending change email:", err));

    return {
      message: "کد تایید به ایمیل جدید شما ارسال شد",
      newEmail: data.newEmail,
    };
  },

  // [AUTH] Verify OTP and apply new email
  async verifyChangeEmail(userId: string, data: VerifyChangeEmailInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("کاربر یافت نشد", 404);
    }

    if (
      !user.pendingNewEmail ||
      !user.changeEmailCode ||
      !user.changeEmailExpires
    ) {
      throw new AppError("درخواست تغییر ایمیل معتبر نیست", 400, {
        code: "ابتدا درخواست تغییر ایمیل دهید",
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

      throw new AppError("کد منقضی شده است", 400, {
        code: "کد منقضی شده است، دوباره درخواست دهید",
      });
    }

    if (user.changeEmailCode !== data.code) {
      throw new AppError("کد اشتباه است", 400, {
        code: "کد وارد شده صحیح نیست",
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

      throw new AppError(
        "این ایمیل در فاصله درخواست تا تایید توسط شخص دیگری ثبت شده است",
        400,
      );
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
      message: "ایمیل شما با موفقیت تغییر یافت. لطفاً مجدداً وارد شوید",
      newEmail: user.pendingNewEmail,
    };
  },

  // [AUTH] Resend change email OTP
  async resendChangeEmailCode(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("کاربر یافت نشد", 404);
    }

    if (!user.pendingNewEmail) {
      throw new AppError("ابتدا درخواست تغییر ایمیل دهید", 400);
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
      user.name || "کاربر گرامی",
      user.pendingNewEmail,
      code,
    );

    // [EMAIL] Resend OTP to pending new email
    sendEmail({
      to: user.pendingNewEmail,
      subject: "📧 تایید تغییر ایمیل",
      html: emailHtml,
      text: `کد تایید: ${code}`,
    }).catch((err) => console.error("❌ Error sending change email:", err));

    return {
      message: "کد تایید مجدداً به ایمیل جدید ارسال شد",
      newEmail: user.pendingNewEmail,
    };
  },
};