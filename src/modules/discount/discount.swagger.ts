const discountExample = {
  id: "discount-uuid",
  code: "WELCOME20",
  type: "PERCENTAGE",
  value: 20,
  maxUses: 100,
  usedCount: 15,
  expiresAt: "2026-12-31T23:59:59.000Z",
  active: true,
  createdAt: "2026-01-15T14:00:00.000Z",
  updatedAt: "2026-01-15T14:00:00.000Z",
};

export const discountSwagger = {
  paths: {
    "/api/discounts": {
      post: {
        tags: ["Discount"],
        summary: "Create new discount code (Admin)",
        description:
          "Creates a new discount code. Code is auto-converted to uppercase.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code", "type", "value", "maxUses", "expiresInDays"],
                properties: {
                  code: {
                    type: "string",
                    minLength: 3,
                    maxLength: 50,
                    example: "WELCOME20",
                    description:
                      "فقط حروف انگلیسی، اعداد، _ و -. خودکار به حروف بزرگ تبدیل می‌شود",
                  },
                  type: {
                    type: "string",
                    enum: ["PERCENTAGE", "AMOUNT"],
                    example: "PERCENTAGE",
                    description: "نوع تخفیف",
                  },
                  value: {
                    type: "integer",
                    example: 20,
                    description:
                      "برای PERCENTAGE: 1-100، برای AMOUNT: حداقل 1000 تومان",
                  },
                  maxUses: {
                    type: "integer",
                    minimum: 1,
                    maximum: 10000,
                    example: 100,
                    description: "حداکثر تعداد استفاده",
                  },
                  expiresInDays: {
                    type: "integer",
                    minimum: 1,
                    maximum: 365,
                    example: 30,
                    description: "تعداد روز اعتبار",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Discount code created successfully",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "کد تخفیف با موفقیت ایجاد شد",
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:\n
- code:
  - Required.
  - Min length: 3.
  - Max length: 50.
  - Pattern: A-Z, 0-9, _, -\n
- type:
  - Required.
  - Must be PERCENTAGE or AMOUNT.\n
- value:
  - Required.
  - For PERCENTAGE: 1-100
  - For AMOUNT: minimum 1000 (rial)\n
- maxUses:
  - Required.
  - Min: 1, Max: 10000.\n
- expiresInDays:
  - Required.
  - Min: 1, Max: 365 days.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          409: {
            description: "Conflict: Discount code already exists.",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: { code: "این کد قبلاً استفاده شده است" },
                },
              },
            },
          },
        },
      },

      get: {
        tags: ["Discount"],
        summary: "Get all discount codes (Admin)",
        description:
          "Returns list of all discount codes with pagination and filters.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "string", example: "1" },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "string", example: "10" },
          },
          {
            name: "active",
            in: "query",
            schema: { type: "string", enum: ["true", "false"] },
            description: "Filter by active status",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string", maxLength: 100 },
            description: "Search in discount codes (case-insensitive)",
          },
        ],
        responses: {
          200: {
            description: "List of Discount Codes",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [discountExample],
                    pagination: { page: 1, limit: 10, total: 5 },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
        },
      },
    },

    "/api/discounts/{id}/toggle": {
      patch: {
        tags: ["Discount"],
        summary: "Toggle discount active status (Admin)",
        description: "Activates or deactivates a discount code.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Status Code is Changed.",
            content: {
              "application/json": {
                examples: {
                  activated: {
                    summary: "فعال شد",
                    value: {
                      status: "success",
                      data: {
                        message: "کد تخفیف فعال شد",
                      },
                    },
                  },
                  deactivated: {
                    summary: "غیرفعال شد",
                    value: {
                      status: "success",
                      data: {
                        message: "کد تخفیف غیرفعال شد",
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Capacity is full.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message:
                    "نمی‌توان کد را فعال کرد، ظرفیت استفاده تمام شده است",
                  code: 400,
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Discount not found." },
          410: {
            description: "Code has expired.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message:
                    "نمی‌توان کد منقضی شده را فعال کرد. ابتدا کد جدید بسازید",
                  code: 410,
                },
              },
            },
          },
        },
      },
    },

    "/api/discounts/{id}": {
      delete: {
        tags: ["Discount"],
        summary: "Delete discount code (Admin)",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Discound Code is Deleted.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { message: "کد تخفیف با موفقیت حذف شد" },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Discount not found." },
        },
      },
    },

    "/api/cart/apply-discount": {
      post: {
        tags: ["Cart"],
        summary: "Apply discount code to cart",
        description:
          "Applies a discount code to user's cart. Validates code's active status, expiration, and usage limit.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code"],
                properties: {
                  code: {
                    type: "string",
                    example: "WELCOME20",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Code Discount Applied.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "کد تخفیف با موفقیت اعمال شد",
                    discount: {
                      code: "WELCOME20",
                      type: "PERCENTAGE",
                      value: 20,
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "غیرفعال یا ظرفیت تمام.",
            content: {
              "application/json": {
                examples: {
                  inactive: {
                    summary: "غیرفعال",
                    value: {
                      status: "error",
                      message: "این کد تخفیف غیرفعال است",
                      code: 400,
                    },
                  },
                  maxUses: {
                    summary: "ظرفیت تمام",
                    value: {
                      status: "error",
                      message: "ظرفیت استفاده از این کد تمام شده است",
                      code: 400,
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          404: { description: "Discount code not found." },
          410: { description: "Discount code expired." },
        },
      },
    },

    "/api/cart/discount": {
      delete: {
        tags: ["Cart"],
        summary: "Remove discount from cart",
        description: "Removes the currently applied discount code from cart.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "Code removed.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { message: "کد تخفیف از سبد حذف شد" },
                },
              },
            },
          },
          400: {
            description: "Code not in cart.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "کد تخفیفی در سبد شما نیست",
                  code: 400,
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          404: { description: "Cart not found." },
        },
      },
    },
  },
};
