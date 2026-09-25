export const walletSwagger = {
  paths: {
    "/api/wallet": {
      get: {
        tags: ["Wallet"],
        summary: "Get user's wallet balance",
        description:
          "Returns the authenticated user's wallet. If wallet doesn't exist, it's created automatically with balance 0.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "Wallet balance retrieved successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "wallet-uuid",
                        balance: 5000000,
                        userId: "user-uuid",
                        user: {
                          id: "user-uuid",
                          email: "ali@example.com",
                          name: "علی رضایی",
                          phone: "09121234567",
                          avatar:
                            "https://res.cloudinary.com/.../avatars/user.jpg",
                        },
                        updatedAt: "2026-01-15T14:00:00.000Z",
                      },
                    ],
                    pagination: { page: 1, limit: 20, total: 150 },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
        },
      },
    },

    "/api/wallet/charge": {
      post: {
        tags: ["Wallet"],
        summary: "Initiate wallet charge via ZarinPal",
        description: `
Creates a PENDING transaction and returns ZarinPal payment URL.

## فلوی کامل پرداخت برای فرانت:

1. **Front-End:** POST /api/wallet/charge -  به همراه مبلغ

2. **Backend:** \`paymentUrl\` برمی‌گرداند

3. **Front-End:** \`window.location.href = paymentUrl\` (کاربر به زرین پال می‌رود)

4. **User:** در زرین پال پرداخت می‌کند

5. **ZarinPal:** کاربر را به Backend می‌فرستد (داخلی)

6. **Backend:** verify می‌کند و موجودی را شارژ می‌کند

7. **Backend:** کاربر را به فرانت ریدایرکت می‌کند:
   - **موفق:** \`{FRONTEND_URL}/payment/success?status=success&refId=X&amount=Y&newBalance=Z&transactionId=T\`

   - **ناموفق:** \`{FRONTEND_URL}/payment/failed?status=failed&reason=Z&authority=X\`

## صفحات لازم در فرانت:
- \`/payment/success\` - نمایش پیام موفقیت با اطلاعات تراکنش

- \`/payment/failed\` - نمایش پیام خطا با دلیل
        `,
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["amount"],
                properties: {
                  amount: {
                    type: "integer",
                    minimum: 10000,
                    maximum: 500000000,
                    example: 1000000,
                    description:
                      "مبلغ به ریال (حداقل 10,000 - حداکثر 500,000,000)",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Payment request created successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "لطفاً برای پرداخت به آدرس زیر مراجعه کنید",
                    paymentUrl:
                      "https://sandbox.zarinpal.com/pg/StartPay/S0000000000000000000000000000xxxxxx",
                    transactionId: "tx-uuid",
                    authority: "S0000000000000000000000000000xxxxxx",
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- amount:
  - Must not be empty.
  - Must be a number.
  - Must be an integer.
  - Minimum: 10,000 (ریال).
  - Maximum: 500,000,000 (ریال).`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          500: {
            description: "Error in communication with ZarinPal",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "خطا در ارتباط با درگاه پرداخت",
                  code: 500,
                },
              },
            },
          },
        },
      },
    },

    "/api/wallet/transactions": {
      get: {
        tags: ["Wallet"],
        summary: "Get user's transaction history",
        description:
          "Returns the authenticated user's transactions with filters and pagination.",
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
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
            },
          },
          {
            name: "type",
            in: "query",
            schema: {
              type: "string",
              enum: ["CHARGE", "PURCHASE", "REFUND"],
            },
          },
        ],
        responses: {
          200: {
            description: "Transaction history retrieved successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "tx-uuid",
                        amount: 1000000,
                        status: "SUCCESS",
                        type: "CHARGE",
                        authority: "S0000...",
                        refId: "12345678",
                        description: "شارژ کیف پول",
                        userId: "user-uuid",
                        user: {
                          id: "user-uuid",
                          email: "ali@example.com",
                          name: "علی",
                          avatar:
                            "https://res.cloudinary.com/.../avatars/user.jpg",
                        },
                        course: null,
                        createdAt: "2026-01-15T14:00:00.000Z",
                      },
                    ],
                    pagination: { page: 1, limit: 20, total: 500 },
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- page:
  - Optional.
  - Must be a numeric string.

- limit:
  - Optional.
  - Must be a numeric string.

- status:
  - Optional.
  - Must be one of: PENDING, SUCCESS, FAILED, CANCELLED.

- type:
  - Optional.
  - Must be one of: CHARGE, PURCHASE, REFUND.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
        },
      },
    },

    "/api/wallet/admin/wallets": {
      get: {
        tags: ["Wallet"],
        summary: "Get all wallets (Admin)",
        description:
          "Returns all users' wallets with filters and pagination. Admin access required.",
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
            name: "minBalance",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "maxBalance",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "List of wallets retrieved successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "wallet-uuid",
                        balance: 5000000,
                        userId: "user-uuid",
                        user: {
                          id: "user-uuid",
                          email: "ali@example.com",
                          name: "علی رضایی",
                          phone: "09121234567",
                        },
                        updatedAt: "2026-01-15T14:00:00.000Z",
                      },
                    ],
                    pagination: { page: 1, limit: 20, total: 150 },
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- page:
  - Optional.
  - Must be a numeric string.

- limit:
  - Optional.
  - Must be a numeric string.

- minBalance:
  - Optional.
  - Must be a numeric string.

- maxBalance:
  - Optional.
  - Must be a numeric string.

- search:
  - Optional.
  - Must be a string.
  - Max length: 100.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
        },
      },
    },

    "/api/wallet/admin/transactions": {
      get: {
        tags: ["Wallet"],
        summary: "Get all transactions (Admin)",
        description:
          "Returns all transactions across the platform with powerful filters. Admin access required.",
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
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
            },
          },
          {
            name: "type",
            in: "query",
            schema: {
              type: "string",
              enum: ["CHARGE", "PURCHASE", "REFUND"],
            },
          },
          {
            name: "startDate",
            in: "query",
            schema: { type: "string", format: "date-time" },
          },
          {
            name: "endDate",
            in: "query",
            schema: { type: "string", format: "date-time" },
          },
        ],
        responses: {
          200: {
            description: "List of all transactions with pagination.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "tx-uuid",
                        amount: 1000000,
                        status: "SUCCESS",
                        type: "CHARGE",
                        authority: "S0000...",
                        refId: "12345678",
                        description: "شارژ کیف پول",
                        userId: "user-uuid",
                        user: {
                          id: "user-uuid",
                          email: "ali@example.com",
                          name: "علی",
                        },
                        course: null,
                        createdAt: "2026-01-15T14:00:00.000Z",
                      },
                    ],
                    pagination: { page: 1, limit: 20, total: 500 },
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- page:
  - Optional.
  - Must be a numeric string.

- limit:
  - Optional.
  - Must be a numeric string.

- status:
  - Optional.
  - Must be one of: PENDING, SUCCESS, FAILED, CANCELLED.

- type:
  - Optional.
  - Must be one of: CHARGE, PURCHASE, REFUND.

- userId:
  - Optional.
  - Must be a valid UUID v4.

- startDate:
  - Optional.
  - Must be a valid ISO 8601 datetime.

- endDate:
  - Optional.
  - Must be a valid ISO 8601 datetime.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
        },
      },
    },
  },
};
