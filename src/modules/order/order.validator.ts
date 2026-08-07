import { z } from "zod";

// [VALID] Checkout schema
export const checkoutSchema = z.object({
  body: z.object({
    paymentMethod: z.enum(["WALLET", "ZARINPAL"], {
      error: "روش پرداخت باید WALLET یا ZARINPAL باشد",
    }),
  }),
});

// [VALID] Get order by ID schema
export const getOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه سفارش نامعتبر است"),
  }),
});

// [VALID] Cancel order schema
export const cancelOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه سفارش نامعتبر است"),
  }),
});

// [VALID] List my orders schema
export const listOrdersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
    status: z.enum(["PENDING", "PAID", "CANCELLED"]).optional(),
  }),
});

// [VALID] Admin get order by ID schema
export const getAdminOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه سفارش نامعتبر است"),
  }),
});

// [VALID] Admin list orders schema
export const listAdminOrdersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
    status: z.enum(["PENDING", "PAID", "CANCELLED"]).optional(),
    search: z.string().trim().max(100).optional(),
  }),
});

export type ListAdminOrdersQuery = z.infer<
  typeof listAdminOrdersSchema
>["query"];
export type CheckoutInput = z.infer<typeof checkoutSchema>["body"];
export type ListOrdersQuery = z.infer<typeof listOrdersSchema>["query"];
