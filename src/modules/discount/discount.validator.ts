import { z } from "zod";

// [VALID] Create discount schema
export const createDiscountSchema = z
  .object({
    body: z.object({
      code: z
        .string({ error: "کد الزامی است" })
        .min(3, "کد باید حداقل ۳ کاراکتر باشد")
        .max(50, "کد نباید بیشتر از ۵۰ کاراکتر باشد")
        .regex(/^[A-Z0-9_-]+$/i, "کد فقط می‌تواند شامل حروف، اعداد، _ و - باشد")
        .transform((val) => val.toUpperCase()),
      type: z.enum(["PERCENTAGE", "AMOUNT"], {
        error: "نوع تخفیف باید PERCENTAGE یا AMOUNT باشد",
      }),
      value: z.coerce
        .number({ error: "مقدار الزامی است" })
        .int("مقدار باید عدد صحیح باشد")
        .positive("مقدار باید مثبت باشد"),
      maxUses: z.coerce
        .number({ error: "حداکثر تعداد استفاده الزامی است" })
        .int()
        .min(1, "حداقل ۱")
        .max(10000, "حداکثر ۱۰۰۰۰"),
      expiresInDays: z.coerce
        .number({ error: "تعداد روز انقضا الزامی است" })
        .int()
        .min(1, "حداقل ۱ روز")
        .max(365, "حداکثر ۳۶۵ روز"),
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
      message:
        "برای درصد مقدار باید بین ۱-۱۰۰ و برای مقدار حداقل ۱۰۰۰ ریال باشد",
      path: ["body", "value"],
    },
  );

// [VALID] List discounts schema
export const listDiscountsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
    active: z.enum(["true", "false"]).optional(),
    search: z.string().max(100).optional(),
  }),
});

// [VALID] Toggle discount schema
export const toggleDiscountSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
});

// [VALID] Delete discount schema
export const deleteDiscountSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
});

// [VALID] Apply discount schema
export const applyDiscountSchema = z.object({
  body: z.object({
    code: z
      .string({ error: "کد الزامی است" })
      .min(1, "کد نمی‌تواند خالی باشد")
      .max(50)
      .transform((val) => val.toUpperCase().trim()),
  }),
});

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>["body"];
export type ListDiscountsQuery = z.infer<typeof listDiscountsSchema>["query"];
export type ApplyDiscountInput = z.infer<typeof applyDiscountSchema>["body"];
