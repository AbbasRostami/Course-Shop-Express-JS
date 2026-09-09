export const faTranslations = {
  auth: {
    errors: {
      unauthorized: "ابتدا باید وارد حساب کاربری خود شوید",
      forbidden: "شما دسترسی لازم برای این عملیات را ندارید",
      invalidToken: "توکن شما معتبر نیست، لطفا ابتدا وارد شوید",
      userNotFound: "کاربر یافت نشد",
      accountBanned: "حساب کاربری شما مسدود شده است",
      emailExists: "کاربری با این ایمیل قبلاً ثبت‌ نام کرده است",
      otpStillValid:
        "کد تایید قبلی هنوز معتبر است. لطفاً ایمیل خود را بررسی کنید یا از گزینه «ارسال مجدد کد» استفاده کنید",
      emailSendFailed: "ارسال ایمیل تایید ناموفق بود. لطفاً دوباره تلاش کنید.",
      invalidOtp: "کد تایید اشتباه است",
      expiredOtp: "کد تایید منقضی شده است، لطفاً مجدداً ثبت‌نام کنید",
      notVerified:
        "حساب کاربری شما هنوز تایید نشده است. ابتدا ایمیل خود را تایید کنید",
      invalidCredentials: "ایمیل یا رمز عبور اشتباه است",
      invalidRefreshToken: "توکن نوسازی نامعتبر یا منقضی شده است",
      sessionExpired: "نشست شما منقضی شده است، لطفا دوباره وارد شوید",
      refreshTokenNotFound: "توکن نوسازی یافت نشد",
      currentPasswordIncorrect: "رمز عبور فعلی اشتباه است",
      sameEmail: "ایمیل جدید نمی‌تواند با ایمیل فعلی یکسان باشد",
      emailTaken: "این ایمیل قبلاً استفاده شده است",
      passwordIncorrect: "رمز عبور اشتباه است",
      invalidEmailChangeRequest: "درخواست تغییر ایمیل معتبر نیست",
      expiredCode: "کد منقضی شده است، دوباره درخواست دهید",
      emailTakenDuringProcess:
        "این ایمیل در فاصله درخواست تا تایید توسط شخص دیگری ثبت شده است",
      requestEmailChangeFirst: "ابتدا درخواست تغییر ایمیل دهید",
      invalidResetRequest: "درخواست بازیابی معتبر نیست",
      expiredResetCode: "کد بازیابی منقضی شده است، دوباره درخواست دهید",
      incorrectResetCode: "کد بازیابی اشتباه است",
    },
    success: {
      otpSent: "کد تایید به ایمیل شما ارسال شد",
      otpResent: "کد تایید جدید به ایمیل شما ارسال شد",
      loginSuccess: "ورود با موفقیت انجام شد",
      refreshSuccess: "تمدید موفق",
      logoutSuccess: "خروج با موفقیت انجام شد",
      resetEmailSent:
        "اگر این ایمیل در سیستم وجود داشته باشد، کد بازیابی ارسال شد",
      passwordResetSuccess:
        "رمز عبور شما با موفقیت تغییر یافت. لطفاً مجدداً وارد شوید",
      verificationResent: "کد تایید مجدداً به ایمیل ارسال شد",
      passwordChanged: "رمز عبور با موفقیت تغییر یافت. لطفاً مجدداً وارد شوید",
      changeEmailOtpSent: "کد تایید به ایمیل جدید شما ارسال شد",
      emailChangedSuccess:
        "ایمیل شما با موفقیت تغییر یافت. لطفاً مجدداً وارد شوید",
      changeEmailCodeResent: "کد تایید مجدداً به ایمیل جدید ارسال شد",
    },
    email: {
      verificationSubject: "🔑 کد تایید حساب کاربری",
      verificationText: "کد تایید شما: {{code}}",
      resetSubject: "🔐 بازیابی رمز عبور",
      resetText: "کد بازیابی شما: {{code}}",
      changeEmailSubject: "📧 تایید تغییر ایمیل",
      changeEmailText: "کد تایید تغییر ایمیل: {{code}}",
      dearUser: "کاربر گرامی",
    },
    validation: {
      emailRequired: "ایمیل الزامی است",
      emailInvalid: "ایمیل وارد شده معتبر نیست",
      passwordRequired: "رمز عبور الزامی است",
      passwordMin: "رمز عبور باید حداقل ۶ کاراکتر باشد",
      nameRequired: "نام الزامی است",
      nameMin: "نام باید حداقل ۲ کاراکتر باشد",
      otpRequired: "کد الزامی است",
      otpLength: "کد تایید باید ۶ رقمی باشد",
      currentPasswordRequired: "رمز عبور فعلی الزامی است",
      currentPasswordMin: "رمز عبور فعلی نمی‌تواند خالی باشد",
      newPasswordRequired: "رمز عبور جدید الزامی است",
      newPasswordMin: "رمز عبور جدید باید حداقل ۶ کاراکتر باشد",
      newPasswordSameAsCurrent: "رمز عبور جدید نباید با رمز فعلی یکسان باشد",
      newEmailRequired: "ایمیل جدید الزامی است",
      codeLength: "کد باید ۶ رقمی باشد",
    },
    limiters: {
      login:
        "تعداد تلاش‌های ناموفق برای ورود بیش از حد مجاز است. لطفاً 15 دقیقه دیگر تلاش کنید.",
      registerIp:
        "تعداد درخواست‌های ثبت‌نام از این IP بیش از حد مجاز است. لطفاً 1 ساعت دیگر تلاش کنید.",
      registerEmail:
        "تعداد درخواست‌های ثبت‌نام برای این ایمیل بیش از حد مجاز است. لطفاً 1 ساعت دیگر تلاش کنید.",
      forgotPassword:
        "تعداد درخواست‌های بازیابی رمز عبور بیش از حد مجاز است. لطفاً 1 ساعت دیگر تلاش کنید.",
      resetPassword:
        "تعداد تلاش‌های ناموفق برای بازیابی رمز بیش از حد مجاز است. لطفاً 15 دقیقه دیگر تلاش کنید.",
      resendVerify:
        "تعداد درخواست‌های ارسال مجدد کد تایید بیش از حد مجاز است. لطفاً 5 دقیقه دیگر تلاش کنید.",
      resendReset:
        "تعداد درخواست‌های ارسال مجدد کد بازیابی بیش از حد مجاز است. لطفاً 5 دقیقه دیگر تلاش کنید.",
      changeEmail:
        "تعداد درخواست‌های تغییر ایمیل بیش از حد مجاز است. لطفاً 1 ساعت دیگر تلاش کنید.",
      resendChangeEmail:
        "تعداد درخواست‌های ارسال مجدد کد تغییر ایمیل بیش از حد مجاز است. لطفاً 5 دقیقه دیگر تلاش کنید.",
    },
  },
  common: {
    serverError: "خطایی در سمت سرور رخ داده است. لطفاً بعداً تلاش کنید.",
    validationError: "خطا در اعتبارسنجی داده‌های ورودی",
  },
};

export const enTranslations: typeof faTranslations = {
  auth: {
    errors: {
      unauthorized: "You must log in to your account first",
      forbidden: "You do not have the required permissions for this operation",
      invalidToken: "Your token is invalid, please log in first",
      userNotFound: "User not found",
      accountBanned: "Your account has been banned",
      emailExists: "A user with this email is already registered",
      otpStillValid:
        "The previous verification code is still valid. Please check your email or use 'Resend Code'",
      emailSendFailed: "Failed to send verification email. Please try again.",
      invalidOtp: "Verification code is incorrect",
      expiredOtp: "Verification code has expired, please register again",
      notVerified:
        "Your account is not verified yet. Please verify your email first",
      invalidCredentials: "Email or password is incorrect",
      invalidRefreshToken: "Refresh token is invalid or expired",
      sessionExpired: "Your session has expired, please log in again",
      refreshTokenNotFound: "Refresh token not found",
      currentPasswordIncorrect: "Current password is incorrect",
      sameEmail: "New email cannot be the same as your current email",
      emailTaken: "This email is already in use",
      passwordIncorrect: "Password is incorrect",
      invalidEmailChangeRequest: "Email change request is invalid",
      expiredCode: "Code has expired, please request again",
      emailTakenDuringProcess:
        "This email was taken by someone else during the process",
      requestEmailChangeFirst: "Please request an email change first",
      invalidResetRequest: "Invalid reset request",
      expiredResetCode: "Reset code has expired, please request again",
      incorrectResetCode: "Reset code is incorrect",
    },
    success: {
      otpSent: "Verification code has been sent to your email",
      otpResent: "A new verification code has been sent to your email",
      loginSuccess: "Logged in successfully",
      refreshSuccess: "Token refreshed successfully",
      logoutSuccess: "Logged out successfully",
      resetEmailSent:
        "If this email exists in the system, a recovery code has been sent",
      passwordResetSuccess:
        "Your password has been changed successfully. Please log in again",
      verificationResent: "Verification code has been resent to your email",
      passwordChanged: "Password changed successfully. Please log in again",
      changeEmailOtpSent: "Verification code has been sent to your new email",
      emailChangedSuccess:
        "Your email has been changed successfully. Please log in again",
      changeEmailCodeResent:
        "Verification code has been resent to your new email",
    },
    email: {
      verificationSubject: "🔑 Account Verification Code",
      verificationText: "Your verification code: {{code}}",
      resetSubject: "🔐 Password Reset",
      resetText: "Your reset code: {{code}}",
      changeEmailSubject: "📧 Confirm Email Change",
      changeEmailText: "Your email change verification code: {{code}}",
      dearUser: "Dear User",
    },
    validation: {
      emailRequired: "Email is required",
      emailInvalid: "The entered email is invalid",
      passwordRequired: "Password is required",
      passwordMin: "Password must be at least 6 characters",
      nameRequired: "Name is required",
      nameMin: "Name must be at least 2 characters",
      otpRequired: "Code is required",
      otpLength: "Verification code must be 6 digits",
      currentPasswordRequired: "Current password is required",
      currentPasswordMin: "Current password cannot be empty",
      newPasswordRequired: "New password is required",
      newPasswordMin: "New password must be at least 6 characters",
      newPasswordSameAsCurrent:
        "New password must not be the same as current password",
      newEmailRequired: "New email is required",
      codeLength: "Code must be 6 digits",
    },
    limiters: {
      login: "Too many failed login attempts. Please try again in 15 minutes.",
      registerIp:
        "Too many registration requests from this IP. Please try again in 1 hour.",
      registerEmail:
        "Too many registration requests for this email. Please try again in 1 hour.",
      forgotPassword:
        "Too many password recovery requests. Please try again in 1 hour.",
      resetPassword:
        "Too many failed password reset attempts. Please try again in 15 minutes.",
      resendVerify:
        "Too many verification code requests. Please try again in 5 minutes.",
      resendReset:
        "Too many recovery code requests. Please try again in 5 minutes.",
      changeEmail:
        "Too many email change requests. Please try again in 1 hour.",
      resendChangeEmail:
        "Too many email change code requests. Please try again in 5 minutes.",
    },
  },
  common: {
    serverError: "An error occurred on the server. Please try again later.",
    validationError: "Input validation failed",
  },
};

export type TranslationKeys = typeof faTranslations;
