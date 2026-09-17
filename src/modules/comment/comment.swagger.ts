export const commentSwagger = {
  paths: {
    "/api/comments": {
      post: {
        tags: ["Comment"],
        summary: "Create a comment or reply",
        description:
          "Creates a new comment on a course or post. If parentId is provided, it becomes a reply. All comments start with PENDING status and require admin approval.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["content"],
                properties: {
                  content: {
                    type: "string",
                    minLength: 2,
                    maxLength: 1000,
                    example: "این دوره خیلی عالی بود",
                  },
                  courseId: { type: "string", format: "uuid" },
                  postId: { type: "string", format: "uuid" },
                  parentId: { type: "string", format: "uuid" },
                },
              },
              examples: {
                courseComment: {
                  summary: "Comment on a course",
                  value: {
                    content: "این دوره خیلی عالی بود",
                    courseId: "6de9db62-0cf8-46f7-a74e-cdcb6d6f2a55",
                  },
                },
                reply: {
                  summary: "Reply to a comment",
                  value: {
                    content: "موافقم، خیلی خوب بود",
                    courseId: "6de9db62-0cf8-46f7-a74e-cdcb6d6f2a55",
                    parentId: "dfc2a5b9-4170-4282-a0b7-21416b0ff4d1",
                  },
                },
                postComment: {
                  summary: "Comment on a blog post",
                  value: {
                    content: "مقاله خوبی بود",
                    postId: "5a80bf83-f5be-4cf6-9980-b95d2a6b2475",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Comment submitted successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "کامنت با موفقیت ثبت شد و در انتظار تأیید است",
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- content: Required. Min 2, Max 1000.
- courseId or postId: Required (exactly one).
- parentId: Optional UUID. Must belong to same course/post.
- Cannot provide both courseId and postId simultaneously.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          404: {
            description: "Course, post, or parent comment not found.",
          },
        },
      },
    },

    "/api/comments/course/{slug}": {
      get: {
        tags: ["Comment"],
        summary: "Get course comments (tree)",
        description:
          "Returns approved comments for a course as a tree structure. **Slug can be Persian or English.** Pagination applies to root comments only.",
        parameters: [
          {
            name: "Accept-Language",
            in: "header",
            schema: { type: "string", enum: ["fa", "en"], default: "fa" },
          },
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string", example: "react-advanced" },
          },
          { name: "page", in: "query", schema: { type: "string", example: "1" } },
          { name: "limit", in: "query", schema: { type: "string", example: "10" } },
        ],
        responses: {
          200: {
            description: "List of course comments as a tree.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "c1",
                        content: "این دوره خیلی خوب بود",
                        status: "APPROVED",
                        userId: "u1",
                        courseId: "course-uuid",
                        postId: null,
                        parentId: null,
                        createdAt: "2026-01-10T12:00:00.000Z",
                        updatedAt: "2026-01-10T12:00:00.000Z",
                        user: { id: "u1", name: "Ali", avatar: null },
                        stats: { replies: 1, reactions: 2 },
                        reactions: {
                          likes: 2,
                          dislikes: 0,
                          myReaction: null,
                        },
                        replies: [
                          {
                            id: "c2",
                            content: "موافقم",
                            status: "APPROVED",
                            userId: "u2",
                            createdAt: "2026-01-10T12:05:00.000Z",
                            user: { id: "u2", name: "Sara", avatar: null },
                            stats: { replies: 0, reactions: 0 },
                            reactions: {
                              likes: 0,
                              dislikes: 0,
                              myReaction: null,
                            },
                            replies: [],
                          },
                        ],
                      },
                    ],
                    pagination: { total: 1, page: 1, limit: 10 },
                  },
                },
              },
            },
          },
          404: { description: "Course not found." },
        },
      },
    },

    "/api/comments/post/{slug}": {
      get: {
        tags: ["Comment"],
        summary: "Get post comments (tree)",
        description:
          "Returns approved comments for a blog post as a tree structure. **Slug can be Persian or English.**",
        parameters: [
          {
            name: "Accept-Language",
            in: "header",
            schema: { type: "string", enum: ["fa", "en"], default: "fa" },
          },
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string", example: "react-vs-vue" },
          },
          { name: "page", in: "query", schema: { type: "string", example: "1" } },
          { name: "limit", in: "query", schema: { type: "string", example: "10" } },
        ],
        responses: {
          200: {
            description: "List of post comments as a tree.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "c1",
                        content: "مقاله خیلی خوبی بود",
                        status: "APPROVED",
                        userId: "u1",
                        postId: "post-uuid",
                        parentId: null,
                        createdAt: "2026-01-10T12:00:00.000Z",
                        user: { id: "u1", name: "Ali", avatar: null },
                        stats: { replies: 0, reactions: 3 },
                        reactions: {
                          likes: 3,
                          dislikes: 0,
                          myReaction: null,
                        },
                        replies: [],
                      },
                    ],
                    pagination: { total: 1, page: 1, limit: 10 },
                  },
                },
              },
            },
          },
          404: { description: "Post not found." },
        },
      },
    },

    "/api/comments/my-comments": {
      get: {
        tags: ["Comment"],
        summary: "Get my comments",
        description:
          "Returns all comments of the authenticated user with optional status filter. **Nested course/post title is localized based on `Accept-Language` header.**",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "Accept-Language",
            in: "header",
            schema: { type: "string", enum: ["fa", "en"], default: "fa" },
          },
          { name: "page", in: "query", schema: { type: "string", example: "1" } },
          { name: "limit", in: "query", schema: { type: "string", example: "10" } },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["PENDING", "APPROVED", "REJECTED"],
            },
          },
        ],
        responses: {
          200: {
            description: "List of user comments.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "c1",
                        content: "این دوره خیلی خوب بود",
                        status: "PENDING",
                        userId: "u1",
                        courseId: "course-1",
                        postId: null,
                        parentId: null,
                        createdAt: "2026-01-10T12:00:00.000Z",
                        user: { id: "u1", name: "Ali", avatar: null },
                        parent: null,
                        course: {
                          id: "course-1",
                          title: "آموزش React پیشرفته",
                          slug: "react-advanced",
                        },
                        post: null,
                        stats: { replies: 0, reactions: 0 },
                      },
                    ],
                    pagination: { total: 1, page: 1, limit: 10 },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
        },
      },
    },

    "/api/comments/admin": {
      get: {
        tags: ["Comment"],
        summary: "Get all comments (Admin)",
        description:
          "Returns all comments with filters for admin moderation panel. **Course/post titles are localized.**",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "Accept-Language",
            in: "header",
            schema: { type: "string", enum: ["fa", "en"], default: "fa" },
          },
          { name: "page", in: "query", schema: { type: "string", example: "1" } },
          { name: "limit", in: "query", schema: { type: "string", example: "20" } },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["PENDING", "APPROVED", "REJECTED"],
            },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search in comment content",
          },
        ],
        responses: {
          200: {
            description: "List of all comments.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "c1",
                        content: "این دوره خیلی خوب بود",
                        status: "PENDING",
                        user: { id: "u1", name: "Ali", avatar: null },
                        parent: null,
                        course: {
                          id: "course-1",
                          title: "آموزش React پیشرفته",
                          slug: "react-advanced",
                        },
                        post: null,
                        stats: { replies: 2, reactions: 1 },
                      },
                    ],
                    pagination: { total: 15, page: 1, limit: 20 },
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

    "/api/comments/{id}/approve": {
      patch: {
        tags: ["Comment"],
        summary: "Admin: Approve a comment",
        description: "Changes comment status to APPROVED.",
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
            description: "Comment approved successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { message: "کامنت با موفقیت تأیید شد" },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Comment not found." },
          409: {
            description: "Comment is already approved.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "این کامنت قبلاً تأیید شده است",
                  code: 409,
                },
              },
            },
          },
        },
      },
    },

    "/api/comments/{id}/reject": {
      patch: {
        tags: ["Comment"],
        summary: "Admin: Reject a comment",
        description: "Changes comment status to REJECTED.",
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
            description: "Comment rejected successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { message: "کامنت با موفقیت رد شد" },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Comment not found." },
          409: {
            description: "Comment is already rejected.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "این کامنت قبلاً رد شده است",
                  code: 409,
                },
              },
            },
          },
        },
      },
    },

    "/api/comments/{id}": {
      delete: {
        tags: ["Comment"],
        summary: "Delete a comment",
        description:
          "Deletes a comment. Only the comment owner or an admin can delete. Cascade deletes all replies.",
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
            description: "Comment deleted successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { message: "کامنت با موفقیت حذف شد" },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: {
            description: "Permission denied: Only the comment owner or admin can delete.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "شما اجازه حذف این کامنت را ندارید",
                  code: 403,
                },
              },
            },
          },
          404: { description: "Comment not found." },
        },
      },
    },
  },
};