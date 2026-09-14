export const searchSwagger = {
  paths: {
    "/api/search": {
      get: {
        tags: ["Search"],
        summary: "Global search across courses and posts",
        description:
          "Searches published courses and blog posts by title/content across **both Persian and English columns**. Returns limited results for quick search / autocomplete. Text fields in response are localized based on `Accept-Language` header.",
        parameters: [
          {
            name: "Accept-Language",
            in: "header",
            schema: { type: "string", enum: ["fa", "en"], default: "fa" },
          },
          {
            name: "q",
            in: "query",
            required: true,
            schema: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              example: "react",
            },
            description: "Search query (matches both Fa and En columns)",
          },
          {
            name: "type",
            in: "query",
            schema: {
              type: "string",
              enum: ["course", "post"],
            },
            description:
              "Filter result type. If not provided, both are searched.",
          },
          {
            name: "limit",
            in: "query",
            schema: {
              type: "string",
              example: "5",
            },
            description: "Max results per type (default: 5, max: 20)",
          },
        ],
        responses: {
          200: {
            description: "Search results.",
            content: {
              "application/json": {
                examples: {
                  both: {
                    summary: "Search across all",
                    value: {
                      status: "success",
                      data: {
                        query: "react",
                        courses: [
                          {
                            id: "course-uuid",
                            title: "آموزش React پیشرفته",
                            slug: "react-advanced",
                            description: "یادگیری کامل React",
                            imageUrl: "/uploads/courses/react.jpg",
                            price: 500000,
                            level: "INTERMEDIATE",
                            category: {
                              id: "cat-uuid",
                              name: "فرانت‌اند",
                              slug: "frontend",
                            },
                          },
                        ],
                        posts: [
                          {
                            id: "post-uuid",
                            title: "مقایسه React و Vue",
                            slug: "react-vs-vue",
                            imageUrl: "/uploads/posts/react-vue.jpg",
                            category: {
                              id: "cat-uuid",
                              name: "فرانت‌اند",
                              slug: "frontend",
                            },
                          },
                        ],
                      },
                    },
                  },
                  noResults: {
                    summary: "No results",
                    value: {
                      status: "success",
                      data: {
                        query: "xyz123",
                        courses: [],
                        posts: [],
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- q: Required. Min 1, Max 100.
- type: Optional. Enum: course, post.
- limit: Optional. Default 5, Max 20.`,
          },
        },
      },
    },
  },
};