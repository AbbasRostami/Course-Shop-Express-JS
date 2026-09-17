import { z } from "zod";

// [VALID] Create discount schema
export const createDiscountSchema = z
  .object({
    body: z.object({
      code: z
        .string({ error: "discount.validation.codeRequired" })
        .min(3, "discount.validation.codeMin")
        .max(50, "discount.validation.codeMax")
        .regex(/^[A-Z0-9_-]+$/i, "discount.validation.codeRegex")
        .transform((val) => val.toUpperCase()),
      type: z.enum(["PERCENTAGE", "AMOUNT"], {
        error: "discount.validation.typeInvalid",
      }),
      value: z.coerce
        .number({ error: "discount.validation.valueRequired" })
        .int("discount.validation.valueInt")
        .positive("discount.validation.valuePositive"),
      maxUses: z.coerce
        .number({ error: "discount.validation.maxUsesRequired" })
        .int()
        .min(1, "discount.validation.maxUsesMin")
        .max(10000, "discount.validation.maxUsesMax"),
      expiresInDays: z.coerce
        .number({ error: "discount.validation.expiresRequired" })
        .int()
        .min(1, "discount.validation.expiresMin")
        .max(365, "discount.validation.expiresMax"),
    }),
  })
  .refine(
    (data) => {
      // [LOGIC] Validate value range based on type
      if (data.body.type === "PERCENTAGE") {
        return data.body.value >= 1 && data.body.value <= 100;
      }
      return data.body.value >= 1000;
    },
    {
      message: "discount.validation.refineMessage",
      path: ["body", "value"],
    },
  );

// [VALID] List discounts schema
export const listDiscountsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, "discount.validation.pageNumber")
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, "discount.validation.limitNumber")
      .optional(),
    active: z.enum(["true", "false"]).optional(),
    search: z.string().max(100).optional(),
  }),
});

// [VALID] Toggle discount schema
export const toggleDiscountSchema = z.object({
  params: z.object({
    id: z.string().uuid("discount.validation.idInvalid"),
  }),
});

// [VALID] Delete discount schema
export const deleteDiscountSchema = z.object({
  params: z.object({
    id: z.string().uuid("discount.validation.idInvalid"),
  }),
});

// [VALID] Apply discount schema
export const applyDiscountSchema = z.object({
  body: z.object({
    code: z
      .string({ error: "discount.validation.codeRequired" })
      .min(1, "discount.validation.codeEmpty")
      .max(50)
      .transform((val) => val.toUpperCase().trim()),
  }),
});

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>["body"];
export type ListDiscountsQuery = z.infer<typeof listDiscountsSchema>["query"];
export type ApplyDiscountInput = z.infer<typeof applyDiscountSchema>["body"];
