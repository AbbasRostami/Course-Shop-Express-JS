import { z } from "zod";

// [VALID] Charge wallet schema
export const chargeWalletSchema = z.object({
  body: z.object({
    amount: z
      .number({ error: "مبلغ باید عدد باشد" })
      .int("مبلغ باید عدد صحیح باشد")
      .min(10000, "حداقل مبلغ شارژ ۱۰،۰۰۰ ریال (۱،۰۰۰ تومان) است")
      .max(500000000, "حداکثر مبلغ شارژ ۵۰۰،۰۰۰،۰۰۰ ریال (۵۰ میلیون تومان) است"),
  }),
});

// [VALID] List user transactions schema
export const listUserTransactionsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
    status: z.enum(["PENDING", "SUCCESS", "FAILED", "CANCELLED"]).optional(),
    type: z.enum(["CHARGE", "PURCHASE", "REFUND"]).optional(),
  }),
});

// [VALID] Admin list wallets schema
export const listWalletsAdminSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
    minBalance: z.string().regex(/^\d+$/, "minBalance باید عدد باشد").optional(),
    maxBalance: z.string().regex(/^\d+$/, "maxBalance باید عدد باشد").optional(),
    search: z.string().max(100).optional(),
  }),
});

// [VALID] Admin list transactions schema
export const listAdminTransactionsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
    status: z.enum(["PENDING", "SUCCESS", "FAILED", "CANCELLED"]).optional(),
    type: z.enum(["CHARGE", "PURCHASE", "REFUND"]).optional(),
    userId: z.string().uuid("شناسه کاربر نامعتبر است").optional(),
    startDate: z.string().datetime("تاریخ شروع نامعتبر است").optional(),
    endDate: z.string().datetime("تاریخ پایان نامعتبر است").optional(),
  }),
});

export type ChargeWalletInput = z.infer<typeof chargeWalletSchema>["body"];
export type ListUserTransactionsQuery = z.infer<typeof listUserTransactionsSchema>["query"];
export type ListWalletsAdminQuery = z.infer<typeof listWalletsAdminSchema>["query"];
export type ListAdminTransactionsQuery = z.infer<typeof listAdminTransactionsSchema>["query"];