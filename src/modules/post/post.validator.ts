import { z } from "zod";

// [UTIL] Strip HTML tags and measure real text length
const getPlainTextLength = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;

// [VALID] Rich text content field
const richTextContent = z
  .string({ message: "محتوا الزامی است" })
  .min(1, "محتوا الزامی است")
  .refine((val) => getPlainTextLength(val) >= 10, {
    message: "محتوا باید حداقل ۱۰ کاراکتر متن واقعی داشته باشد",
  })
  .refine((val) => val.length <= 100000, {
    message: "محتوا بیش از حد طولانی است",
  });

// [VALID] Create post schema
export const createPostSchema = z.object({
  body: z.object({
    title: z
      .string({ error: "عنوان الزامی است" })
      .min(3, "عنوان باید حداقل ۳ کاراکتر باشد")
      .max(200, "عنوان نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد")
      .trim(),
    content: richTextContent,
    categoryId: z
      .string({ message: "شناسه دسته‌بندی الزامی است" })
      .uuid("شناسه دسته‌بندی نامعتبر است"),
    published: z
      .union([z.boolean(), z.enum(["true", "false"])], {
        message: "مقدار published باید true یا false باشد",
      })
      .transform((val) => val === true || val === "true")
      .optional(),
  }),
});

// [VALID] Update post schema
export const updatePostSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
  body: z
    .object({
      title: z
        .string()
        .min(3, "عنوان باید حداقل ۳ کاراکتر باشد")
        .max(200, "عنوان نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد")
        .trim()
        .optional(),
      content: richTextContent.optional(),
      categoryId: z.string().uuid("شناسه دسته‌بندی نامعتبر است").optional(),
      published: z
        .union([z.boolean(), z.enum(["true", "false"])], {
          message: "مقدار published باید true یا false باشد",
        })
        .transform((val) => val === true || val === "true")
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "حداقل یک فیلد برای ویرایش الزامی است",
    }),
});

// [VALID] Delete post schema
export const deletePostSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
});

// [VALID] Toggle publish post schema
export const togglePublishPostSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
  body: z.object({
    published: z
      .union([z.boolean(), z.enum(["true", "false"])])
      .transform((val) => val === true || val === "true"),
  }),
});

// [VALID] Public list posts schema
export const listPostsPublicSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
    category: z.string().optional(),
    search: z.string().trim().max(100).optional(),
    sortBy: z.enum(["createdAt", "title"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

// [VALID] Admin list posts schema
export const listPostsAdminSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
    published: z.enum(["true", "false"]).optional(),
    search: z.string().trim().max(100).optional(),
    sortBy: z.enum(["createdAt", "title"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

// [VALID] Get post by slug schema
export const getPostBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1).max(200),
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>["body"];
export type UpdatePostInput = z.infer<typeof updatePostSchema>["body"];
export type ListPostsPublicQuery = z.infer<typeof listPostsPublicSchema>["query"];
export type ListPostsAdminQuery = z.infer<typeof listPostsAdminSchema>["query"];