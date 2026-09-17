export const postSwagger = {
  paths: {
    "/api/posts": {
      get: {
        tags: ["Post"],
        summary: "Get public posts",
        description:
          "Returns list of published blog posts. Text fields are localized based on `Accept-Language` header. Search works on both Fa and En columns.",
        parameters: [
          {
            name: "Accept-Language",
            in: "header",
            schema: { type: "string", enum: ["fa", "en"], default: "fa" },
          },
          { name: "page", in: "query", schema: { type: "string", example: "1" } },
          { name: "limit", in: "query", schema: { type: "string", example: "10" } },
          {
            name: "category",
            in: "query",
            schema: { type: "string" },
            description: "Category slug (Fa or En)",
          },
          { name: "search", in: "query", schema: { type: "string", example: "react" } },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["createdAt", "titleFa", "titleEn"],
              default: "createdAt",
            },
          },
          {
            name: "order",
            in: "query",
            schema: {
              type: "string",
              enum: ["asc", "desc"],
              default: "desc",
            },
          },
        ],
        responses: {
          200: {
            description: "List of public posts.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "post-uuid",
                        title: "مقایسه React و Vue",
                        slug: "react-vs-vue",
                        content: "در این مقاله...",
                        imageUrl: "/uploads/posts/react-vue.jpg",
                        published: true,
                        createdAt: "2026-01-10T12:00:00.000Z",
                        updatedAt: "2026-01-10T12:00:00.000Z",
                        category: {
                          id: "cat-uuid",
                          name: "فرانت‌اند",
                          slug: "frontend",
                        },
                        stats: { comments: 8 },
                        reactions: {
                          likes: 23,
                          dislikes: 2,
                          myReaction: null,
                        },
                        isFavorite: false,
                      },
                    ],
                    pagination: { page: 1, limit: 10, total: 5 },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Post"],
        summary: "Create a post (Admin)",
        description:
          "Must be submitted as **multipart/form-data**. Both Persian and English fields are required.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: [
                  "titleFa",
                  "titleEn",
                  "contentFa",
                  "contentEn",
                  "categoryId",
                ],
                properties: {
                  titleFa: {
                    type: "string",
                    minLength: 3,
                    maxLength: 200,
                    example: "مقایسه React و Vue",
                  },
                  titleEn: {
                    type: "string",
                    minLength: 3,
                    maxLength: 200,
                    example: "React vs Vue Comparison",
                  },
                  contentFa: {
                    type: "string",
                    example: "<p>در این مقاله...</p>",
                  },
                  contentEn: {
                    type: "string",
                    example: "<p>In this article...</p>",
                  },
                  categoryId: { type: "string", format: "uuid" },
                  published: { type: "boolean", default: false },
                  image: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Post created successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "پست با موفقیت ایجاد شد",
                    post: {
                      id: "post-uuid",
                      title: "مقایسه React و Vue",
                      slug: "react-vs-vue",
                      content: "<p>در این مقاله...</p>",
                      imageUrl: "/uploads/posts/post-uuid.jpg",
                      published: false,
                      category: null,
                      stats: { comments: 0 },
                      createdAt: "2026-01-10T12:00:00.000Z",
                      updatedAt: "2026-01-10T12:00:00.000Z",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- titleFa & titleEn: Required. Min 3, Max 200.
- contentFa & contentEn: Required. Min plain-text length: 10. Max 100,000.
- categoryId: Required UUID. Category must exist.
- published: Optional boolean.
- image: Optional. Max 5 MB.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Access denied: Admin only." },
        },
      },
    },

    "/api/posts/admin": {
      get: {
        tags: ["Post"],
        summary: "Get all posts (Admin)",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "Accept-Language",
            in: "header",
            schema: { type: "string", enum: ["fa", "en"], default: "fa" },
          },
          { name: "page", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "string" } },
          {
            name: "published",
            in: "query",
            schema: { type: "string", enum: ["true", "false"] },
          },
          { name: "search", in: "query", schema: { type: "string" } },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["createdAt", "titleFa", "titleEn"],
            },
          },
          {
            name: "order",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"] },
          },
        ],
        responses: {
          200: {
            description: "List of all posts.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [],
                    pagination: { page: 1, limit: 10, total: 0 },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Access denied: Admin only." },
        },
      },
    },

    "/api/posts/{slug}": {
      get: {
        tags: ["Post"],
        summary: "Get post by slug (Fa or En)",
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
        ],
        responses: {
          200: {
            description: "Details of the post.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    post: {
                      id: "post-uuid",
                      title: "مقایسه React و Vue",
                      slug: "react-vs-vue",
                      content: "<p>در این مقاله...</p>",
                      imageUrl: "/uploads/posts/react-vue.jpg",
                      published: true,
                      category: {
                        id: "cat-uuid",
                        name: "فرانت‌اند",
                        slug: "frontend",
                      },
                      stats: { comments: 8 },
                      reactions: {
                        likes: 23,
                        dislikes: 2,
                        myReaction: "LIKE",
                      },
                      isFavorite: true,
                      createdAt: "2026-01-10T12:00:00.000Z",
                      updatedAt: "2026-01-10T12:00:00.000Z",
                    },
                  },
                },
              },
            },
          },
          404: { description: "Post not found." },
        },
      },
    },

    "/api/posts/{id}": {
      put: {
        tags: ["Post"],
        summary: "Update a post (Admin)",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  titleFa: { type: "string", minLength: 3, maxLength: 200 },
                  titleEn: { type: "string", minLength: 3, maxLength: 200 },
                  contentFa: { type: "string" },
                  contentEn: { type: "string" },
                  categoryId: { type: "string", format: "uuid" },
                  published: { type: "boolean" },
                  image: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Post updated successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { message: "پست با موفقیت ویرایش شد" },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- id (path): Must be a valid UUID v4.
- titleFa/titleEn: Optional. Min 3, Max 200.
- contentFa/contentEn: Optional. Min 10, Max 100,000.
- categoryId: Optional UUID.
- published: Optional boolean.
- image: Optional. Max 5 MB.
- At least one field required.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Access denied: Admin only." },
          404: { description: "Post not found." },
        },
      },
      delete: {
        tags: ["Post"],
        summary: "Delete a post (Admin)",
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
            description: "Post deleted successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { message: "پست با موفقیت حذف شد" },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Access denied: Admin only." },
          404: { description: "Post not found." },
        },
      },
    },

    "/api/posts/{id}/publish": {
      patch: {
        tags: ["Post"],
        summary: "Toggle post publish (Admin)",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["published"],
                properties: {
                  published: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Publish status changed." },
          400: { description: "Post is already in this status." },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Access denied: Admin only." },
          404: { description: "Post not found." },
        },
      },
    },
  },
};