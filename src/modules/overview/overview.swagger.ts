const adminUserExample = {
  total: 1234,
  verified: 1100,
  unverified: 134,
  admins: 5,
  regular: 1229,
  newThisWeek: 25,
  newThisMonth: 120,
};

const adminCourseExample = {
  total: 45,
  published: 38,
  unpublished: 7,
  totalEnrollments: 850,
};

const adminOrderExample = {
  total: 500,
  pending: 12,
  paid: 450,
  cancelled: 38,
  today: 5,
};

const adminRevenueExample = {
  sales: {
    total: 250000000,
    today: 5000000,
    thisWeek: 30000000,
    thisMonth: 100000000,
  },
  walletCharges: {
    total: 50000000,
    today: 1000000,
    thisWeek: 5000000,
    thisMonth: 20000000,
  },
};

const adminDiscountExample = {
  total: 15,
  active: 8,
  expiringThisWeek: [
    {
      id: "discount-uuid",
      code: "WELCOME20",
      type: "PERCENTAGE",
      value: 20,
      expiresAt: "2026-01-20T00:00:00.000Z",
    },
  ],
  topUsed: [
    {
      id: "discount-uuid",
      code: "WELCOME20",
      type: "PERCENTAGE",
      value: 20,
      usedCount: 45,
      maxUses: 100,
    },
  ],
};

const adminCommentExample = {
  total: 320,
  approved: 280,
  pending: 30,
  rejected: 10,
  latestPending: [
    {
      id: "comment-uuid",
      content: "این دوره چطور بود؟",
      status: "PENDING",
      createdAt: "2026-01-15T14:00:00.000Z",
      user: {
        id: "user-uuid",
        name: "علی",
        email: "al***@example.com",
      },
      course: {
        id: "course-uuid",
        title: "آموزش React",
        slug: "react-advanced",
      },
      post: null,
    },
  ],
};

const adminPostExample = {
  total: 30,
  published: 25,
  unpublished: 5,
};

const adminEnrollmentExample = {
  total: 850,
  thisWeek: 30,
  thisMonth: 120,
  topCourses: [
    {
      id: "course-uuid",
      title: "آموزش React پیشرفته",
      slug: "react-advanced",
      imageUrl: "/uploads/courses/react.jpg",
      enrollments: 250,
    },
  ],
};

const adminFullExample = {
  user: adminUserExample,
  course: adminCourseExample,
  order: adminOrderExample,
  revenue: adminRevenueExample,
  discount: adminDiscountExample,
  comment: adminCommentExample,
  post: adminPostExample,
  enrollment: adminEnrollmentExample,
};

const unauthorizedResponse = {
  401: { description: "Unauthorized: Invalid or expired token." },
};

const forbiddenResponse = {
  403: { description: "Forbidden: Admin access required." },
};

const localeHeader = {
  name: "Accept-Language",
  in: "header",
  schema: { type: "string", enum: ["fa", "en"], default: "fa" },
  description: "Localization for course/post titles in nested data",
};

export const overviewSwagger = {
  paths: {
    "/api/overview/admin": {
      get: {
        tags: ["Overview"],
        summary: "Get full admin overview (all sections)",
        description:
          "Returns aggregated stats for all admin sections including users, courses, orders, revenue, discounts, comments, posts, and enrollments. **Course/post titles in nested data (comments, topCourses) are localized based on `Accept-Language` header.**",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [localeHeader],
        responses: {
          200: {
            description: "Stats for all admin sections.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: adminFullExample,
                },
              },
            },
          },
          ...unauthorizedResponse,
          ...forbiddenResponse,
        },
      },
    },

    "/api/overview/admin/users": {
      get: {
        tags: ["Overview"],
        summary: "Admin: Users stats",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "Stats of users.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { user: adminUserExample },
                },
              },
            },
          },
          ...unauthorizedResponse,
          ...forbiddenResponse,
        },
      },
    },

    "/api/overview/admin/courses": {
      get: {
        tags: ["Overview"],
        summary: "Admin: Courses stats",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "Stats of courses.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { course: adminCourseExample },
                },
              },
            },
          },
          ...unauthorizedResponse,
          ...forbiddenResponse,
        },
      },
    },

    "/api/overview/admin/orders": {
      get: {
        tags: ["Overview"],
        summary: "Admin: Orders stats",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "Stats of orders.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { order: adminOrderExample },
                },
              },
            },
          },
          ...unauthorizedResponse,
          ...forbiddenResponse,
        },
      },
    },

    "/api/overview/admin/revenue": {
      get: {
        tags: ["Overview"],
        summary: "Admin: Revenue stats (sales + wallet charges)",
        description:
          "Revenue statistics split into two categories:\n\n" +
          "**Sales**: Total revenue from paid orders\n" +
          "- Source: `Order.totalAmount` where `status = PAID`\n\n" +
          "**Wallet Charges**: Total wallet top-ups\n" +
          "- Source: `Transaction.amount` where `type = CHARGE` and `status = SUCCESS`",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description:
              "Revenue statistics with breakdown of sales and wallet charges.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { revenue: adminRevenueExample },
                },
              },
            },
          },
          ...unauthorizedResponse,
          ...forbiddenResponse,
        },
      },
    },

    "/api/overview/admin/discounts": {
      get: {
        tags: ["Overview"],
        summary: "Admin: Discounts stats",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "Stats of discount codes.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { discount: adminDiscountExample },
                },
              },
            },
          },
          ...unauthorizedResponse,
          ...forbiddenResponse,
        },
      },
    },

    "/api/overview/admin/comments": {
      get: {
        tags: ["Overview"],
        summary: "Admin: Comments stats",
        description:
          "Includes latest pending comments. **Course/post titles are localized based on `Accept-Language`.**",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [localeHeader],
        responses: {
          200: {
            description: "Stats of comments.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { comment: adminCommentExample },
                },
              },
            },
          },
          ...unauthorizedResponse,
          ...forbiddenResponse,
        },
      },
    },

    "/api/overview/admin/posts": {
      get: {
        tags: ["Overview"],
        summary: "Admin: Posts stats",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "Stats of posts.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { post: adminPostExample },
                },
              },
            },
          },
          ...unauthorizedResponse,
          ...forbiddenResponse,
        },
      },
    },

    "/api/overview/admin/enrollments": {
      get: {
        tags: ["Overview"],
        summary: "Admin: Enrollments stats",
        description:
          "Includes top 5 courses by enrollment count. **Course titles are localized based on `Accept-Language`.**",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [localeHeader],
        responses: {
          200: {
            description: "Stats of course enrollments.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { enrollment: adminEnrollmentExample },
                },
              },
            },
          },
          ...unauthorizedResponse,
          ...forbiddenResponse,
        },
      },
    },
  },
};
