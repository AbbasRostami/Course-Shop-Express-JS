export const teacherSwagger = {
  paths: {
    "/api/teachers": {
      get: {
        tags: ["Teacher"],
        summary: "Get all teachers",
        description:
          "Returns list of all teachers with course count. **Text fields (`name`, `slug`, `bio`) are localized based on the `Accept-Language` header (`fa` or `en`).**",
        parameters: [
          {
            name: "Accept-Language",
            in: "header",
            schema: { type: "string", enum: ["fa", "en"], default: "fa" },
            description: "Response language for text fields",
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
            description: "Search across name and bio (both Fa and En columns)",
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
                        coursesCount: 5,
                        createdAt: "2026-01-10T12:00:00.000Z",
                        updatedAt: "2026-01-10T12:00:00.000Z",
                      },
                    ],
                    pagination: {
                      total: 3,
                      page: 1,
                      limit: 10,
                    },
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
                  avatar: {
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
                    },
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- nameFa:
  - Required.
  - Must be a string.
  - Min length: 2, Max length: 100.

- nameEn:
  - Required.
  - Must be a string.
  - Min length: 2, Max length: 100.

- bioFa & bioEn:
  - Optional.
  - Must be a string.
  - Max length: 2000.

- avatar:
  - Optional.
  - Max size: 2 MB.
  - Allowed formats: .jpg, .jpeg, .png, .webp.

- Duplicate names may also return 400.`,
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
          "Returns teacher details along with their published courses. **Slug can be Persian or English.** Text fields are localized based on `Accept-Language` header.",
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
            description:
              "Persian or English slug (e.g. `abbas-rostami` or `عباس-رستمی`)",
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
                      createdAt: "2026-01-10T12:00:00.000Z",
                      updatedAt: "2026-01-10T12:00:00.000Z",
                      courses: [
                        {
                          id: "course-uuid",
                          title: "React Course",
                          slug: "react-course",
                          description: "Complete guide to React with Next.js",
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
          404: { description: "Teacher not found." },
        },
      },
    },

    "/api/teachers/{id}": {
      put: {
        tags: ["Teacher"],
        summary: "Update a teacher (Admin)",
        description:
          "Must be submitted as **multipart/form-data**. All fields are optional. If name changes, slug is auto-regenerated for that language.",
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
                  bioFa: {
                    type: "string",
                    maxLength: 2000,
                    nullable: true,
                  },
                  bioEn: {
                    type: "string",
                    maxLength: 2000,
                    nullable: true,
                  },
                  avatar: {
                    type: "string",
                    format: "binary",
                  },
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
                  data: {
                    message: "مدرس با موفقیت ویرایش شد",
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- id (path): Must be a valid UUID v4.
- nameFa/nameEn: Optional. Min 2, Max 100.
- bioFa/bioEn: Optional or null. Max 2000.
- avatar: Optional. Max 2 MB. .jpg, .jpeg, .png, .webp.
- At least one field required.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Teacher not found." },
        },
      },
      delete: {
        tags: ["Teacher"],
        summary: "Delete a teacher (Admin)",
        description:
          "Permanently deletes a teacher and their avatar. **Cannot delete a teacher who has courses assigned.**",
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
                  data: {
                    message: "مدرس با موفقیت حذف شد",
                  },
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
                    "این مدرس ۳ دوره دارد. ابتدا دوره‌ها را حذف یا به مدرس دیگری منتقل کنید",
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
  },
};