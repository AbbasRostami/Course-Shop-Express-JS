import { z } from "zod";

// [VALID] Register schema
export const registerSchema = z.object({
  body: z.object({
    email: z
      .string("auth.validation.emailRequired")
      .trim()
      .min(1, "auth.validation.emailRequired")
      .email("auth.validation.emailInvalid"),
    password: z
      .string("auth.validation.passwordRequired")
      .min(6, "auth.validation.passwordMin"),
    name: z.string().optional(),
  }),
});

// [VALID] Verify email schema
export const verifyEmailSchema = z.object({
  body: z.object({
    email: z
      .string("auth.validation.emailRequired")
      .trim()
      .min(1, "auth.validation.emailRequired")
      .email("auth.validation.emailInvalid"),
    code: z
      .string("auth.validation.otpRequired")
      .length(6, "auth.validation.otpLength"),
  }),
});

// [VALID] Login schema
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string("auth.validation.emailRequired")
      .trim()
      .min(1, "auth.validation.emailRequired")
      .email("auth.validation.emailInvalid"),
    password: z
      .string("auth.validation.passwordRequired")
      .trim()
      .min(1, "auth.validation.passwordRequired"),
  }),
});

// [VALID] Forgot password schema
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string("auth.validation.emailRequired")
      .trim()
      .min(1, "auth.validation.emailRequired")
      .email("auth.validation.emailInvalid"),
  }),
});

// [VALID] Reset password schema
export const resetPasswordSchema = z.object({
  body: z.object({
    email: z
      .string("auth.validation.emailRequired")
      .trim()
      .min(1, "auth.validation.emailRequired")
      .email("auth.validation.emailInvalid"),
    code: z
      .string("auth.validation.otpRequired")
      .length(6, "auth.validation.otpLength"),
    newPassword: z
      .string("auth.validation.passwordRequired")
      .min(6, "auth.validation.passwordMin"),
  }),
});

// [VALID] Resend verification schema
export const resendVerificationSchema = z.object({
  body: z.object({
    email: z
      .string("auth.validation.emailRequired")
      .trim()
      .min(1, "auth.validation.emailRequired")
      .email("auth.validation.emailInvalid"),
  }),
});

// [VALID] Resend reset code schema
export const resendResetCodeSchema = z.object({
  body: z.object({
    email: z
      .string("auth.validation.emailRequired")
      .trim()
      .min(1, "auth.validation.emailRequired")
      .email("auth.validation.emailInvalid"),
  }),
});

// [VALID] Change password schema
export const changePasswordSchema = z
  .object({
    body: z.object({
      currentPassword: z
        .string("auth.validation.currentPasswordRequired")
        .trim()
        .min(1, "auth.validation.currentPasswordMin"),
      newPassword: z
        .string("auth.validation.newPasswordRequired")
        .min(6, "auth.validation.newPasswordMin"),
    }),
  })
  .refine((data) => data.body.currentPassword !== data.body.newPassword, {
    message: "auth.validation.newPasswordSameAsCurrent",
    path: ["body", "newPassword"],
  });

// [VALID] Request change email schema
export const requestChangeEmailSchema = z.object({
  body: z.object({
    newEmail: z
      .string("auth.validation.newEmailRequired")
      .trim()
      .min(1, "auth.validation.newEmailRequired")
      .email("auth.validation.emailInvalid"),
    password: z
      .string("auth.validation.passwordRequired")
      .trim()
      .min(1, "auth.validation.passwordRequired"),
  }),
});

// [VALID] Verify change email schema
export const verifyChangeEmailSchema = z.object({
  body: z.object({
    code: z
      .string("auth.validation.otpRequired")
      .length(6, "auth.validation.codeLength"),
  }),
});

export type RequestChangeEmailInput = z.infer<
  typeof requestChangeEmailSchema
>["body"];
export type VerifyChangeEmailInput = z.infer<
  typeof verifyChangeEmailSchema
>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];
export type ResendVerificationInput = z.infer<
  typeof resendVerificationSchema
>["body"];
export type ResendResetCodeInput = z.infer<
  typeof resendResetCodeSchema
>["body"];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
