import { z } from "zod";

// [VALID] Add to cart schema
export const addToCartSchema = z.object({
  body: z.object({
    courseId: z.string().uuid("شناسه دوره نامعتبر است"),
  }),
});

// [VALID] Remove from cart schema
export const removeFromCartSchema = z.object({
  params: z.object({
    courseId: z.string().uuid("شناسه دوره نامعتبر است"),
  }),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>["body"];