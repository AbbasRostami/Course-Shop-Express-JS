export const enrollmentSwagger = {
  paths: {
    "/api/enrollments/{slug}": {
      post: {
        tags: ["Enrollment"],
        summary: "Enroll in a free course",
        description:
          "Enrolls the authenticated user in a free course only. Paid courses must be purchased through cart. **Slug can be Persian or English.**",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
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
            description: "Course slug (Fa or En)",
          },
        ],
        responses: {
          201: {
            description: "Enrollment created successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "با موفقیت در دوره رایگان ثبت‌نام شدید",
                    enrollment: {
                      id: "enroll-uuid",
                      pricePaid: 0,
                      createdAt: "2026-01-15T14:00:00.000Z",
                      course: {
                        id: "course-uuid",
                        title: "آموزش Git مقدماتی",
                        slug: "آموزش-git",
                        imageUrl: "/uploads/courses/course-uuid.jpg",
                        price: 0,
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description:
              "Already enrolled or attempting to enroll in a paid course.",
            content: {
              "application/json": {
                examples: {
                  alreadyEnrolled: {
                    value: {
                      status: "fail",
                      data: {
                        message: "شما قبلاً در این دوره ثبت‌نام کرده‌اید",
                      },
                    },
                  },
                  paidCourse: {
                    value: {
                      status: "error",
                      message:
                        "برای خرید دوره‌های پولی از سبد خرید استفاده کنید",
                      code: 400,
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          404: { description: "Course not found." },
        },
      },
    },

    "/api/enrollments/my-courses": {
      get: {
        tags: ["Enrollment"],
        summary: "Get user's enrolled courses",
        description:
          "Returns list of enrolled courses with pagination. **Text fields are localized based on `Accept-Language` header.**",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "Accept-Language",
            in: "header",
            schema: { type: "string", enum: ["fa", "en"], default: "fa" },
          },
          { name: "page", in: "query", schema: { type: "string", example: "1" } },
          { name: "limit", in: "query", schema: { type: "string", example: "10" } },
        ],
        responses: {
          200: {
            description: "List of enrolled courses.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "enroll-uuid",
                        pricePaid: 500000,
                        enrolledAt: "2026-01-15T14:00:00.000Z",
                        course: {
                          id: "course-uuid",
                          title: "آموزش React پیشرفته",
                          slug: "آموزش-react-پیشرفته",
                          imageUrl: "/uploads/courses/course-uuid.jpg",
                          price: 500000,
                          level: "INTERMEDIATE",
                          published: true,
                          category: {
                            id: "cat-uuid",
                            name: "فرانت‌اند",
                            slug: "فرانت-اند",
                          },
                          teacher: {
                            id: "teacher-uuid",
                            name: "عباس رستمی",
                            slug: "abbas-rostami",
                            avatar: null,
                          },
                          stats: { enrollments: 25, comments: 12 },
                        },
                      },
                    ],
                    pagination: { page: 1, limit: 10, total: 5 },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
        },
      },
    },
  },
};