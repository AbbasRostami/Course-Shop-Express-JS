export const categorySwagger = {
  paths: {
    "/api/categories": {
      get: {
        tags: ["Category"],
        summary: "Get all public categories",
        description:
          "Returns active categories (show=true) with count of published courses and posts. **Text fields (`name`, `slug`, `description`) are localized based on `Accept-Language` header.**",
        parameters: [
          {
            name: "Accept-Language",
            in: "header",
            schema: { type: "string", enum: ["fa", "en"], default: "fa" },
          },
        ],
        responses: {
          200: {
            description: "List of active categories retrieved successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    categories: [
                      {
                        id: "d3b07384-d113-4956-a5cc-484443028456",
                        name: "فرانت‌اند",
                        slug: "فرانت-اند",
                        description: "آموزش‌های توسعه frontend",
                        show: true,
                        createdAt: "2026-01-15T14:00:00.000Z",
                        updatedAt: "2026-01-15T14:00:00.000Z",
                        _count: { courses: 5, posts: 2 },
                      },
                    ],
                    total: 1,
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Category"],
        summary: "Create new category (Admin)",
        description:
          "Creates a new bilingual category. Slugs are auto-generated from both names.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nameFa", "nameEn"],
                properties: {
                  nameFa: {
                    type: "string",
                    minLength: 2,
                    maxLength: 50,
                    example: "فرانت‌اند",
                  },
                  nameEn: {
                    type: "string",
                    minLength: 2,
                    maxLength: 50,
                    example: "Frontend",
                  },
                  descriptionFa: {
                    type: "string",
                    maxLength: 500,
                    example: "آموزش‌های توسعه فرانت‌اند",
                  },
                  descriptionEn: {
                    type: "string",
                    maxLength: 500,
                    example: "Frontend development tutorials",
                  },
                  show: {
                    type: "boolean",
                    default: true,
                    example: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Category created successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "دسته بندی با موفقیت ایجاد شد",
                    category: {
                      id: "d3b07384-d113-4956-a5cc-484443028456",
                      name: "فرانت‌اند",
                      slug: "فرانت-اند",
                      description: "آموزش‌های توسعه فرانت‌اند",
                      show: true,
                      createdAt: "2026-01-15T14:00:00.000Z",
                      updatedAt: "2026-01-15T14:00:00.000Z",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- nameFa & nameEn:
  - Required.
  - Min length: 2, Max length: 50.

- descriptionFa & descriptionEn:
  - Optional.
  - Max length: 500.

- show:
  - Optional. Boolean. Default: true.

- Duplicate names may return 400.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
        },
      },
    },

    "/api/categories/admin": {
      get: {
        tags: ["Category"],
        summary: "Get all categories with pagination (Admin)",
        description:
          "Returns all categories (including hidden) with pagination, search and filter. Search works on Fa and En columns.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "Accept-Language",
            in: "header",
            schema: { type: "string", enum: ["fa", "en"], default: "fa" },
          },
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
            name: "show",
            in: "query",
            schema: { type: "string", enum: ["true", "false"] },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search across name and description (Fa + En)",
          },
        ],
        responses: {
          200: {
            description: "Categories retrieved with pagination.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "d3b07384-d113-4956-a5cc-484443028456",
                        name: "فرانت‌اند",
                        slug: "فرانت-اند",
                        description: "آموزش‌های frontend",
                        show: true,
                        createdAt: "2026-01-15T14:00:00.000Z",
                        updatedAt: "2026-01-15T14:00:00.000Z",
                        _count: { courses: 10, posts: 5 },
                      },
                    ],
                    pagination: {
                      total: 25,
                      page: 1,
                      limit: 10,
                    },
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

    "/api/categories/{slug}": {
      get: {
        tags: ["Category"],
        summary: "Get category by slug (Fa or En)",
        description:
          "Returns a single active category. **Slug can be either Persian or English.**",
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
            schema: { type: "string", example: "فرانت-اند" },
          },
        ],
        responses: {
          200: {
            description: "Category retrieved successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    category: {
                      id: "d3b07384-d113-4956-a5cc-484443028456",
                      name: "فرانت‌اند",
                      slug: "فرانت-اند",
                      description: "آموزش‌های توسعه فرانت‌اند",
                      show: true,
                      createdAt: "2026-01-15T14:00:00.000Z",
                      updatedAt: "2026-01-15T14:00:00.000Z",
                      _count: { courses: 5, posts: 2 },
                    },
                  },
                },
              },
            },
          },
          404: { description: "Category not found." },
        },
      },
    },

    "/api/categories/{id}": {
      put: {
        tags: ["Category"],
        summary: "Update category (Admin)",
        description:
          "Updates category fields. If a name changes, its corresponding slug is auto-regenerated. At least one field is required.",
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
                properties: {
                  nameFa: {
                    type: "string",
                    minLength: 2,
                    maxLength: 50,
                    example: "فرانت‌اند حرفه‌ای",
                  },
                  nameEn: {
                    type: "string",
                    minLength: 2,
                    maxLength: 50,
                    example: "Advanced Frontend",
                  },
                  descriptionFa: {
                    type: "string",
                    maxLength: 500,
                  },
                  descriptionEn: {
                    type: "string",
                    maxLength: 500,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Category updated successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "دسته بندی با موفقیت ویرایش شد",
                    category: {
                      id: "d3b07384-d113-4956-a5cc-484443028456",
                      name: "Advanced Frontend",
                      slug: "advanced-frontend",
                      description: "Updated description",
                      show: true,
                      createdAt: "2026-01-15T14:00:00.000Z",
                      updatedAt: "2026-01-15T15:00:00.000Z",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- id (path): Must be a valid UUID v4.
- nameFa/nameEn: Optional. Min 2, Max 50.
- descriptionFa/descriptionEn: Optional. Max 500.
- At least one field required.
- Duplicate name may return 400.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Category not found." },
        },
      },
      delete: {
        tags: ["Category"],
        summary: "Delete category (Admin)",
        description:
          "Permanently deletes a category. **Cannot delete a category that has courses or posts assigned.**",
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
            description: "Category deleted successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "دسته بندی با موفقیت حذف شد",
                  },
                },
              },
            },
          },
          400: {
            description: "Cannot delete category with existing courses/posts.",
            content: {
              "application/json": {
                examples: {
                  hasCourses: {
                    value: {
                      status: "error",
                      message:
                        "این دسته بندی 3 دوره دارد. ابتدا دوره‌ها را حذف یا به دسته دیگری منتقل کنید",
                      code: 400,
                    },
                  },
                  hasPosts: {
                    value: {
                      status: "error",
                      message:
                        "این دسته بندی 5 مقاله دارد. ابتدا مقاله‌ها را حذف یا به دسته دیگری منتقل کنید",
                      code: 400,
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Category not found." },
        },
      },
    },

    "/api/categories/{id}/visibility": {
      patch: {
        tags: ["Category"],
        summary: "Toggle category visibility (Admin)",
        description:
          "Activates or deactivates a category. When deactivated, all published courses and posts in this category will be automatically unpublished.",
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
                required: ["show"],
                properties: {
                  show: { type: "boolean", example: false },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Category visibility updated successfully.",
            content: {
              "application/json": {
                examples: {
                  disabled: {
                    value: {
                      status: "success",
                      data: {
                        message:
                          "دسته بندی با موفقیت غیرفعال شد. دوره‌ها و پست‌های وابسته نیز غیرفعال شدند.",
                      },
                    },
                  },
                  enabled: {
                    value: {
                      status: "success",
                      data: {
                        message:
                          "دسته بندی با موفقیت فعال شد. برای انتشار دوره‌ها، آن‌ها را به صورت جداگانه فعالسازی کنید.",
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Category is already in the requested state.",
            content: {
              "application/json": {
                examples: {
                  alreadyActive: {
                    value: {
                      status: "error",
                      message: "دسته بندی از قبل فعال است",
                      code: 400,
                    },
                  },
                  alreadyInactive: {
                    value: {
                      status: "error",
                      message: "دسته بندی از قبل غیرفعال است",
                      code: 400,
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Category not found." },
        },
      },
    },
  },
};