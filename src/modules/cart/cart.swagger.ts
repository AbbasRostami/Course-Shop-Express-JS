const cartExample = {
  id: "cart-uuid",
  totalItems: 2,
  subtotal: 800000,
  discount: null,
  totalPayment: 800000,
  items: [
    {
      id: "item-uuid-1",
      courseId: "course-uuid-1",
      title: "آموزش React پیشرفته",
      slug: "react-advanced",
      price: 500000,
      imageUrl: "/uploads/courses/react.jpg",
      level: "INTERMEDIATE",
      category: { id: "cat-1", name: "فرانت‌اند", slug: "frontend" },
      addedAt: "2026-01-15T14:00:00.000Z",
    },
  ],
};

export const cartSwagger = {
  paths: {
    "/api/cart": {
      get: {
        tags: ["Cart"],
        summary: "Get user's cart",
        description:
          "Returns active cart with all items, subtotal, applied discount and totalPayment. **Text fields are localized based on `Accept-Language` header.**",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "Accept-Language",
            in: "header",
            schema: { type: "string", enum: ["fa", "en"], default: "fa" },
          },
        ],
        responses: {
          200: {
            description: "User cart retrieved successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { cart: cartExample },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
        },
      },
      delete: {
        tags: ["Cart"],
        summary: "Clear entire cart",
        description: "Removes all items from the cart.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "User cart cleared successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { message: "سبد خرید با موفقیت خالی شد" },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
        },
      },
    },

    "/api/cart/items": {
      post: {
        tags: ["Cart"],
        summary: "Add course to cart",
        description:
          "Adds a published, paid course to the cart. Cannot add free courses, already enrolled courses, or duplicates.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["courseId"],
                properties: {
                  courseId: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Course added to cart successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { message: "دوره به سبد خرید اضافه شد" },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- courseId: Required UUID.
- Cannot add free courses (price = 0).
- Cannot add already enrolled courses.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          404: { description: "Course not found or unpublished." },
          409: { description: "Course already in cart." },
        },
      },
    },

    "/api/cart/sync": {
      post: {
        tags: ["Cart"],
        summary: "Sync guest cart with user cart (after login)",
        description:
          "Merges the guest cart (stored in browser LocalStorage) with the authenticated user's cart. **Automatically filters out invalid, free, purchased, or duplicate courses.** Returns a full sync report along with the updated localized cart.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "Accept-Language",
            in: "header",
            schema: { type: "string", enum: ["fa", "en"], default: "fa" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["courseIds"],
                properties: {
                  courseIds: {
                    type: "array",
                    minItems: 1,
                    maxItems: 50,
                    items: { type: "string", format: "uuid" },
                    example: [
                      "6de9db62-0cf8-46f7-a74e-cdcb6d6f2a55",
                      "dfc2a5b9-4170-4282-a0b7-21416b0ff4d1",
                    ],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Cart synced successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "سبد خرید با موفقیت همگام‌سازی شد",
                    summary: { added: 2, skipped: 0 },
                    details: {
                      skippedInvalid: [],
                      skippedEnrolled: [],
                      skippedDuplicate: [],
                    },
                    cart: cartExample,
                  },
                },
              },
            },
          },
          400: {
            description:
              "Invalid request - array length constraint rules exceeded (min 1, max 50).",
          },
          401: { description: "Unauthorized: Invalid or expired token." },
        },
      },
    },

    "/api/cart/items/{courseId}": {
      delete: {
        tags: ["Cart"],
        summary: "Remove course from cart",
        description: "Removes a specific course from the cart.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Course removed from cart successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { message: "دوره از سبد خرید حذف شد" },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          404: { description: "Item not found in cart." },
        },
      },
    },
  },
};
