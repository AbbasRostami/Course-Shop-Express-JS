import { z } from "zod";

// [VALID] Add to cart schema
export const addToCartSchema = z.object({
  body: z.object({
    courseId: z.string().uuid("cart.validation.courseIdInvalid"),
  }),
});

// [VALID] Remove from cart schema
export const removeFromCartSchema = z.object({
  params: z.object({
    courseId: z.string().uuid("cart.validation.courseIdInvalid"),
  }),
});

// [VALID] Sync cart schema (merge guest cart with user cart)
export const syncCartSchema = z.object({
  body: z.object({
    courseIds: z
      .array(z.string().uuid("cart.validation.courseIdInvalid"), {
        error: "cart.validation.courseIdsArray",
      })
      .min(1, "cart.errors.emptyCourseIds")
      .max(50, "cart.errors.tooManyCourseIds"),
  }),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>["body"];
export type SyncCartInput = z.infer<typeof syncCartSchema>["body"];
