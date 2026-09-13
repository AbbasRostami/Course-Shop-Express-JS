export const courseSwagger = {
  paths: {
    "/api/courses": {
      get: {
        tags: ["Course"],
        summary: "Get all public courses with filters",
        description:
          "Returns published courses. Supports filtering, search, sort and pagination. **Text fields are localized based on `Accept-Language` header. Search is performed on both Persian and English columns.**",
        parameters: [
          {
            name: "Accept-Language",
            in: "header",
            schema: { type: "string", enum: ["fa", "en"], default: "fa" },
          },
          { name: "page", in: "query", schema: { type: "string", example: "1" } },
          { name: "limit", in: "query", schema: { type: "string", example: "10" } },
          {
            name: "categories",
            in: "query",
            schema: { type: "array", items: { type: "string" } },
            style: "form",
            explode: true,
            description:
              "Filter by category slugs (Fa or En). Example: ?categories=frontend&categories=backend",
            example: ["frontend", "backend"],
          },
          {
            name: "level",
            in: "query",
            schema: {
              type: "string",
              enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
            },
          },
          { name: "minPrice", in: "query", schema: { type: "string" } },
          { name: "maxPrice", in: "query", schema: { type: "string" } },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search across title and description (Fa + En)",
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["createdAt", "price", "titleFa", "titleEn"],
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
            description: "List of courses with pagination.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "d3b07384-d113-4956-a5cc-484443028456",
                        title: "آموزش React پیشرفته",
                        slug: "آموزش-react-پیشرفته",
                        description: "یادگیری کامل React با Next.js",
                        price: 5000000,
                        imageUrl: "/uploads/courses/course-uuid.jpg",
                        level: "INTERMEDIATE",
                        published: true,
                        createdAt: "2026-01-15T14:00:00.000Z",
                        updatedAt: "2026-01-15T14:00:00.000Z",
                        category: {
                          id: "cat-uuid",
                          name: "فرانت‌اند",
                          slug: "فرانت-اند",
                        },
                        teacher: {
                          id: "teacher-uuid",
                          name: "عباس رستمی",
                          slug: "abbas-rostami",
                          avatar:
                            "https://res.cloudinary.com/.../teachers/avatar.jpg",
                        },
                        stats: { enrollments: 25, comments: 12 },
                        reactions: {
                          likes: 45,
                          dislikes: 3,
                          myReaction: null,
                        },
                        isEnrolled: false,
                        isFavorite: false,
                      },
                    ],
                    pagination: { page: 1, limit: 10, total: 50 },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Course"],
        summary: "Create new course (Admin)",
        description:
          "Must be submitted as **multipart/form-data**. Both Persian and English fields are required.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: [
                  "titleFa",
                  "titleEn",
                  "price",
                  "teacherId",
                  "categoryId",
                ],
                properties: {
                  titleFa: {
                    type: "string",
                    minLength: 3,
                    maxLength: 150,
                    example: "آموزش React پیشرفته",
                  },
                  titleEn: {
                    type: "string",
                    minLength: 3,
                    maxLength: 150,
                    example: "Advanced React Course",
                  },
                  descriptionFa: {
                    type: "string",
                    maxLength: 5000,
                    example: "یادگیری کامل React با Next.js",
                  },
                  descriptionEn: {
                    type: "string",
                    maxLength: 5000,
                    example: "Complete guide to React with Next.js",
                  },
                  price: {
                    type: "number",
                    minimum: 0,
                    maximum: 1000000000,
                    example: 5000000,
                  },
                  level: {
                    type: "string",
                    enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
                    default: "BEGINNER",
                    example: "INTERMEDIATE",
                  },
                  categoryId: {
                    type: "string",
                    format: "uuid",
                    example: "d3b07384-d113-4956-a5cc-484443028456",
                  },
                  teacherId: {
                    type: "string",
                    format: "uuid",
                    example: "59b31b70-bc67-4651-a4ac-7df76528b9b2",
                  },
                  published: {
                    type: "boolean",
                    default: false,
                    example: false,
                  },
                  image: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Course created successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "دوره با موفقیت ایجاد شد",
                    course: {
                      id: "d3b07384-d113-4956-a5cc-484443028456",
                      title: "آموزش React پیشرفته",
                      slug: "آموزش-react-پیشرفته",
                      description: "یادگیری کامل React",
                      price: 5000000,
                      imageUrl:
                        "https://res.cloudinary.com/.../courses/course.jpg",
                      level: "INTERMEDIATE",
                      published: false,
                      teacher: {
                        id: "59b31b70-bc67-4651-a4ac-7df76528b9b2",
                        name: "عباس رستمی",
                        slug: "abbas-rostami",
                        avatar: null,
                      },
                      category: {
                        id: "cat-uuid",
                        name: "فرانت‌اند",
                        slug: "فرانت-اند",
                      },
                      stats: { enrollments: 0, comments: 0 },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- titleFa & titleEn: Required. Min 3, Max 150.
- descriptionFa & descriptionEn: Optional. Max 5000.
- price: Required. Integer. Min 0, Max 1,000,000,000.
- teacherId: Required UUID. Teacher must exist.
- categoryId: Required UUID. Category must exist.
- level: Optional enum.
- published: Optional boolean.
- image: Optional. Max 5 MB.
- Duplicate titles return 400.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
        },
      },
    },

    "/api/courses/admin": {
      get: {
        tags: ["Course"],
        summary: "Get all courses - Admin",
        description:
          "Returns all courses (including unpublished/draft). Text fields localized based on `Accept-Language` header.",
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
            name: "categories",
            in: "query",
            schema: { type: "array", items: { type: "string" } },
            style: "form",
            explode: true,
            description: "Filter by category slugs (Fa or En).",
          },
          {
            name: "level",
            in: "query",
            schema: {
              type: "string",
              enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
            },
          },
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
              enum: ["createdAt", "price", "titleFa", "titleEn"],
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
            description: "List of all courses.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [],
                    pagination: { page: 1, limit: 10, total: 75 },
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

    "/api/courses/{slug}": {
      get: {
        tags: ["Course"],
        summary: "Get course by slug (Fa or En)",
        description:
          "Returns a single published course. **Slug can be Persian or English.**",
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
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Course details.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    course: {
                      id: "d3b07384-d113-4956-a5cc-484443028456",
                      title: "آموزش React پیشرفته",
                      slug: "آموزش-react-پیشرفته",
                      description: "یادگیری کامل React با Next.js",
                      price: 5000000,
                      imageUrl: "/uploads/courses/course-uuid.jpg",
                      level: "INTERMEDIATE",
                      published: true,
                      teacher: {
                        id: "teacher-uuid",
                        name: "عباس رستمی",
                        slug: "abbas-rostami",
                        avatar: null,
                      },
                      category: {
                        id: "cat-uuid",
                        name: "فرانت‌اند",
                        slug: "فرانت-اند",
                      },
                      stats: { enrollments: 125, comments: 45 },
                      reactions: {
                        likes: 45,
                        dislikes: 3,
                        myReaction: null,
                      },
                      isEnrolled: false,
                      enrollment: null,
                      isFavorite: false,
                    },
                  },
                },
              },
            },
          },
          404: { description: "Course not found." },
        },
      },
    },

    "/api/courses/{id}": {
      put: {
        tags: ["Course"],
        summary: "Update course (Admin)",
        description:
          "Must be submitted as **multipart/form-data**. All fields optional. If a title changes, its slug is auto-regenerated.",
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
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  titleFa: { type: "string", minLength: 3, maxLength: 150 },
                  titleEn: { type: "string", minLength: 3, maxLength: 150 },
                  descriptionFa: { type: "string", maxLength: 5000 },
                  descriptionEn: { type: "string", maxLength: 5000 },
                  price: {
                    type: "number",
                    minimum: 0,
                    maximum: 1000000000,
                  },
                  level: {
                    type: "string",
                    enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
                  },
                  categoryId: { type: "string", format: "uuid" },
                  teacherId: { type: "string", format: "uuid" },
                  published: { type: "boolean" },
                  image: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Course updated successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "دوره با موفقیت ویرایش شد",
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- id (path): Must be a valid UUID v4.
- titleFa/titleEn: Optional. Min 3, Max 150.
- descriptionFa/descriptionEn: Optional. Max 5000.
- price: Optional integer.
- teacherId/categoryId: Optional UUID.
- level: Optional enum.
- published: Optional boolean.
- image: Optional. Max 5 MB.
- At least one field required.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Course not found." },
        },
      },
      delete: {
        tags: ["Course"],
        summary: "Delete course (Admin)",
        description:
          "Permanently deletes a course and its image. All related data is cascade-deleted.",
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
            description: "Course deleted successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { message: "دوره با موفقیت حذف شد" },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Course not found." },
        },
      },
    },

    "/api/courses/{id}/publish": {
      patch: {
        tags: ["Course"],
        summary: "Toggle course publish status (Admin)",
        description:
          "Publishes or unpublishes a course. Cannot publish a course if its category is hidden.",
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
          200: {
            description: "Publish status changed successfully.",
            content: {
              "application/json": {
                examples: {
                  published: {
                    value: {
                      status: "success",
                      data: {
                        message: "دوره با موفقیت منتشر شد",
                      },
                    },
                  },
                  unpublished: {
                    value: {
                      status: "success",
                      data: {
                        message: "دوره با موفقیت پنهان شد",
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid publish state or category disabled.",
            content: {
              "application/json": {
                examples: {
                  alreadyPublished: {
                    value: {
                      status: "error",
                      message: "دوره از قبل منتشر شده است",
                      code: 400,
                    },
                  },
                  categoryDisabled: {
                    value: {
                      status: "error",
                      message:
                        "نمی‌توان دوره را منتشر کرد چون دسته‌بندی آن غیرفعال است",
                      code: 400,
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Course not found." },
        },
      },
    },
  },
};