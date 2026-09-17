import { z } from "zod";

// [VALID] Charge wallet schema
export const chargeWalletSchema = z.object({
  body: z.object({
    amount: z
      .number({ error: "wallet.validation.amountType" })
      .int("wallet.validation.amountInt")
      .min(10000, "wallet.validation.amountMin")
      .max(500000000, "wallet.validation.amountMax"),
  }),
});

// [VALID] List user transactions schema
export const listUserTransactionsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "wallet.validation.pageNumber").optional(),
    limit: z
      .string()
      .regex(/^\d+$/, "wallet.validation.limitNumber")
      .optional(),
    status: z.enum(["PENDING", "SUCCESS", "FAILED", "CANCELLED"]).optional(),
    type: z.enum(["CHARGE", "PURCHASE", "REFUND"]).optional(),
  }),
});

// [VALID] Admin list wallets schema
export const listWalletsAdminSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "wallet.validation.pageNumber").optional(),
    limit: z
      .string()
      .regex(/^\d+$/, "wallet.validation.limitNumber")
      .optional(),
    minBalance: z
      .string()
      .regex(/^\d+$/, "wallet.validation.minBalanceNumber")
      .optional(),
    maxBalance: z
      .string()
      .regex(/^\d+$/, "wallet.validation.maxBalanceNumber")
      .optional(),
    search: z.string().max(100, "wallet.validation.searchMax").optional(),
  }),
});

// [VALID] Admin list transactions schema
export const listAdminTransactionsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "wallet.validation.pageNumber").optional(),
    limit: z
      .string()
      .regex(/^\d+$/, "wallet.validation.limitNumber")
      .optional(),
    status: z.enum(["PENDING", "SUCCESS", "FAILED", "CANCELLED"]).optional(),
    type: z.enum(["CHARGE", "PURCHASE", "REFUND"]).optional(),
    userId: z.string().uuid("wallet.validation.userIdInvalid").optional(),
    startDate: z
      .string()
      .datetime("wallet.validation.startDateInvalid")
      .optional(),
    endDate: z.string().datetime("wallet.validation.endDateInvalid").optional(),
  }),
});

export type ChargeWalletInput = z.infer<typeof chargeWalletSchema>["body"];
export type ListUserTransactionsQuery = z.infer<
  typeof listUserTransactionsSchema
>["query"];
export type ListWalletsAdminQuery = z.infer<
  typeof listWalletsAdminSchema
>["query"];
export type ListAdminTransactionsQuery = z.infer<
  typeof listAdminTransactionsSchema
>["query"];
