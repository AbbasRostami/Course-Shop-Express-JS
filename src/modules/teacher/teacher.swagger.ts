export const teacherSwagger = {
  paths: {
    "/api/teachers": {
      get: {
        tags: ["Teacher"],
        summary: "Get all public teachers",
        description:
          "Returns only visible teachers (show=true). Text fields are localized based on `Accept-Language` header.",
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
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search across name and bio (Fa + En)",
          },
        ],
        responses: {
          200: {
            description: "List of teachers.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "teacher-uuid",
                        name: "عباس رستمی",
                        slug: "abbas-rostami",
                        bio: "توسعه‌دهنده فول‌استک",
                        avatar:
                          "https://res.cloudinary.com/.../teachers/avatar.jpg",
                        show: true,
                        coursesCount: 5,
                        createdAt: "2026-01-10T12:00:00.000Z",
                        updatedAt: "2026-01-10T12:00:00.000Z",
                      },
                    ],
                    pagination: { total: 3, page: 1, limit: 10 },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Teacher"],
        summary: "Create a teacher (Admin)",
        description:
          "Must be submitted as **multipart/form-data**. Both Persian and English fields are required.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["nameFa", "nameEn"],
                properties: {
                  nameFa: {
                    type: "string",
                    minLength: 2,
                    maxLength: 100,
                    example: "عباس رستمی",
                  },
                  nameEn: {
                    type: "string",
                    minLength: 2,
                    maxLength: 100,
                    example: "Abbas Rostami",
                  },
                  bioFa: {
                    type: "string",
                    maxLength: 2000,
                    example: "توسعه‌دهنده فول‌استک",
                  },
                  bioEn: {
                    type: "string",
                    maxLength: 2000,
                    example: "Full-stack developer",
                  },
                  show: { type: "boolean", default: true, example: true },
                  avatar: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Teacher created successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "مدرس با موفقیت ایجاد شد",
                    teacher: {
                      id: "teacher-uuid",
                      name: "عباس رستمی",
                      slug: "abbas-rostami",
                      bio: "توسعه‌دهنده فول‌استک",
                      avatar:
                        "https://res.cloudinary.com/.../teachers/avatar.jpg",
                      show: true,
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

    "/api/teachers/admin": {
      get: {
        tags: ["Teacher"],
        summary: "Get all teachers with pagination (Admin)",
        description:
          "Returns all teachers (including hidden) with pagination, search and filter.",
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
            description: "Filter by visibility status",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search across name and bio (Fa + En)",
          },
        ],
        responses: {
          200: {
            description: "Teachers retrieved with pagination.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "teacher-uuid",
                        name: "عباس رستمی",
                        slug: "abbas-rostami",
                        bio: "توسعه‌دهنده فول‌استک",
                        avatar:
                          "https://res.cloudinary.com/.../teachers/avatar.jpg",
                        show: true,
                        coursesCount: 5,
                        createdAt: "2026-01-10T12:00:00.000Z",
                        updatedAt: "2026-01-10T12:00:00.000Z",
                      },
                    ],
                    pagination: { total: 25, page: 1, limit: 10 },
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

    "/api/teachers/{slug}": {
      get: {
        tags: ["Teacher"],
        summary: "Get teacher by slug (Fa or En)",
        description:
          "Returns teacher details with their published courses. **Only visible teachers (show=true) are returned.**",
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
            description: "Persian or English slug",
          },
        ],
        responses: {
          200: {
            description: "Teacher details with courses.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    teacher: {
                      id: "teacher-uuid",
                      name: "Abbas Rostami",
                      slug: "abbas-rostami",
                      bio: "Full-stack developer",
                      avatar:
                        "https://res.cloudinary.com/.../teachers/avatar.jpg",
                      show: true,
                      courses: [
                        {
                          id: "course-uuid",
                          title: "React Course",
                          slug: "react-course",
                          description: "Complete guide",
                          price: 5000000,
                          imageUrl:
                            "https://res.cloudinary.com/.../courses/react.jpg",
                          level: "INTERMEDIATE",
                          category: {
                            id: "cat-uuid",
                            name: "Frontend",
                            slug: "frontend",
                          },
                          studentsCount: 120,
                          createdAt: "2026-01-15T14:00:00.000Z",
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          404: { description: "Teacher not found or inactive." },
        },
      },
    },

    "/api/teachers/{id}": {
      put: {
        tags: ["Teacher"],
        summary: "Update a teacher (Admin)",
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
                  nameFa: { type: "string", minLength: 2, maxLength: 100 },
                  nameEn: { type: "string", minLength: 2, maxLength: 100 },
                  bioFa: { type: "string", maxLength: 2000, nullable: true },
                  bioEn: { type: "string", maxLength: 2000, nullable: true },
                  avatar: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Teacher updated successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { message: "مدرس با موفقیت ویرایش شد" },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Teacher not found." },
        },
      },
      delete: {
        tags: ["Teacher"],
        summary: "Delete a teacher (Admin)",
        description: "**Cannot delete a teacher who has courses assigned.**",
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
            description: "Teacher deleted successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { message: "مدرس با موفقیت حذف شد" },
                },
              },
            },
          },
          400: {
            description: "Teacher has courses assigned.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message:
                    "این مدرس 3 دوره دارد. ابتدا دوره‌ها را حذف یا به مدرس دیگری منتقل کنید",
                  code: 400,
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Teacher not found." },
        },
      },
    },

    "/api/teachers/{id}/visibility": {
      patch: {
        tags: ["Teacher"],
        summary: "Toggle teacher visibility (Admin)",
        description:
          "Activates or deactivates a teacher. **When deactivated, all published courses of this teacher will be automatically unpublished.** When re-activated, courses stay unpublished until manually published.",
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
            description: "Teacher visibility updated successfully.",
            content: {
              "application/json": {
                examples: {
                  disabled: {
                    value: {
                      status: "success",
                      data: {
                        message:
                          "مدرس با موفقیت غیرفعال شد. دوره‌های وابسته نیز غیرفعال شدند.",
                      },
                    },
                  },
                  enabled: {
                    value: {
                      status: "success",
                      data: {
                        message:
                          "مدرس با موفقیت فعال شد. دوره‌های او مجدداً قابل انتشار خواهند بود.",
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Teacher is already in the requested state.",
            content: {
              "application/json": {
                examples: {
                  alreadyActive: {
                    value: {
                      status: "error",
                      message: "مدرس از قبل فعال است",
                      code: 400,
                    },
                  },
                  alreadyInactive: {
                    value: {
                      status: "error",
                      message: "مدرس از قبل غیرفعال است",
                      code: 400,
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Teacher not found." },
        },
      },
    },
  },
};
