// [EMAIL] Verification email template
export const getVerificationEmailTemplate = (
  name: string,
  verificationCode: string,
): string => {
  return `
      <div style="direction: rtl; font-family: 'Tahoma', 'Segoe UI', Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fcfcfc;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0957DE; margin: 0; font-size: 22px;">تایید حساب کاربری</h2>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin-bottom: 20px;" />
        <p style="color: #333; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
          سلام <strong>${name || "کاربر گرامی"}</strong>،<br>
          به پلتفرم ما خوش آمدید! برای تکمیل ثبت‌نام و فعال‌سازی حساب کاربری خود، لطفاً از کد تایید زیر استفاده کنید:
        </p>
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="display: inline-block; background-color: #f0f5ff; border: 2px dashed #0957DE; color: #0957DE; font-size: 26px; font-weight: bold; letter-spacing: 6px; padding: 12px 30px; border-radius: 8px; font-family: monospace;">
            ${verificationCode}
          </div>
        </div>
        <p style="color: #777; font-size: 13px; text-align: center; margin-top: 20px;">
          ⚠️ این کد به دلیل حفظ امنیت شما فقط تا <strong>۱۵ دقیقه</strong> دیگر معتبر است.
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 25px; margin-bottom: 15px;" />
        <p style="color: #999; font-size: 11px; text-align: center; margin: 0;">
          این یک ایمیل خودکار است، لطفاً به آن پاسخ ندهید.
        </p>
      </div>
    `;
};

// [EMAIL] Reset password email template
export const getResetPasswordEmailTemplate = (
  name: string,
  resetCode: string,
): string => {
  return `
    <div style="direction: rtl; font-family: 'Tahoma', 'Segoe UI', Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fcfcfc;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #DC2626; margin: 0; font-size: 22px;">🔐 بازیابی رمز عبور</h2>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin-bottom: 20px;" />
      <p style="color: #333; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
        سلام <strong>${name || "کاربر گرامی"}</strong>،<br>
        درخواست بازیابی رمز عبور برای حساب شما ثبت شده است. لطفاً از کد زیر برای بازنشانی رمز خود استفاده کنید:
      </p>
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-block; background-color: #fef2f2; border: 2px dashed #DC2626; color: #DC2626; font-size: 26px; font-weight: bold; letter-spacing: 6px; padding: 12px 30px; border-radius: 8px; font-family: monospace;">
          ${resetCode}
        </div>
      </div>
      <p style="color: #777; font-size: 13px; text-align: center; margin-top: 20px;">
        ⚠️ این کد به دلیل حفظ امنیت شما فقط تا <strong>۱۵ دقیقه</strong> دیگر معتبر است.
      </p>
      <p style="color: #777; font-size: 12px; text-align: center; margin-top: 15px;">
        🛡️ اگر شما این درخواست را ندادید، این ایمیل را نادیده بگیرید و رمز فعلی شما تغییر نخواهد کرد.
      </p>
      <hr style="border: 0; border-top: 1px solid #eee; margin-top: 25px; margin-bottom: 15px;" />
      <p style="color: #999; font-size: 11px; text-align: center; margin: 0;">
        این یک ایمیل خودکار است، لطفاً به آن پاسخ ندهید.
      </p>
    </div>
  `;
};

// [EMAIL] Change email verification template
export const getChangeEmailTemplate = (
  name: string,
  newEmail: string,
  code: string,
): string => {
  return `
    <div style="direction: rtl; font-family: 'Tahoma', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fcfcfc;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #059669; margin: 0; font-size: 22px;">📧 تایید تغییر ایمیل</h2>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin-bottom: 20px;" />
      <p style="color: #333; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
        سلام <strong>${name || "کاربر گرامی"}</strong>،<br>
        درخواست تغییر ایمیل شما به <strong>${newEmail}</strong> ثبت شده است.<br>
        برای تایید، از کد زیر استفاده کنید:
      </p>
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-block; background-color: #d1fae5; border: 2px dashed #059669; color: #059669; font-size: 26px; font-weight: bold; letter-spacing: 6px; padding: 12px 30px; border-radius: 8px; font-family: monospace;">
          ${code}
        </div>
      </div>
      <p style="color: #777; font-size: 13px; text-align: center; margin-top: 20px;">
        ⚠️ این کد فقط تا <strong>۱۵ دقیقه</strong> دیگر معتبر است.
      </p>
      <p style="color: #777; font-size: 12px; text-align: center; margin-top: 15px;">
        🛡️ اگر شما این درخواست را ندادید، این ایمیل را نادیده بگیرید.
      </p>
      <hr style="border: 0; border-top: 1px solid #eee; margin-top: 25px; margin-bottom: 15px;" />
      <p style="color: #999; font-size: 11px; text-align: center; margin: 0;">
        این یک ایمیل خودکار است، لطفاً به آن پاسخ ندهید.
      </p>
    </div>
  `;
};