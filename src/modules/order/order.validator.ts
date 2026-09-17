import { z } from "zod";

// [VALID] Checkout schema
export const checkoutSchema = z.object({
  body: z.object({
    paymentMethod: z.enum(["WALLET", "ZARINPAL"], {
      error: "order.validation.paymentMethodInvalid",
    }),
  }),
});

// [VALID] Get order by ID schema
export const getOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid("order.validation.idInvalid"),
  }),
});

// [VALID] Cancel order schema
export const cancelOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid("order.validation.idInvalid"),
  }),
});

// [VALID] List my orders schema
export const listOrdersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "order.validation.pageNumber").optional(),
    limit: z.string().regex(/^\d+$/, "order.validation.limitNumber").optional(),
    status: z.enum(["PENDING", "PAID", "CANCELLED"]).optional(),
  }),
});

// [VALID] Admin get order by ID schema
export const getAdminOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid("order.validation.idInvalid"),
  }),
});

// [VALID] Admin list orders schema
export const listAdminOrdersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "order.validation.pageNumber").optional(),
    limit: z.string().regex(/^\d+$/, "order.validation.limitNumber").optional(),
    status: z.enum(["PENDING", "PAID", "CANCELLED"]).optional(),
    search: z.string().trim().max(100).optional(),
  }),
});

export type ListAdminOrdersQuery = z.infer<
  typeof listAdminOrdersSchema
>["query"];
export type CheckoutInput = z.infer<typeof checkoutSchema>["body"];
export type ListOrdersQuery = z.infer<typeof listOrdersSchema>["query"];
