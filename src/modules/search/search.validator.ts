import { z } from "zod";

// [VALID] Search query schema
export const searchSchema = z.object({
  query: z.object({
    q: z
      .string({ error: "متن جستجو الزامی است" })
      .min(1, "متن جستجو نمی‌تواند خالی باشد")
      .max(100, "متن جستجو حداکثر ۱۰۰ کاراکتر")
      .trim(),
    type: z.enum(["course", "post"]).optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
  }),
});

export type SearchQuery = z.infer<typeof searchSchema>["query"];