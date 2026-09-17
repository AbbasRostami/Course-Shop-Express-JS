import { z } from "zod";

// [UTIL] Strip HTML tags and measure real text length
const getPlainTextLength = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;

// [VALID] Rich text content field factory
const richTextContent = (requiredKey: string, minKey: string, maxKey: string) =>
  z
    .string({ message: requiredKey })
    .min(1, requiredKey)
    .refine((val) => getPlainTextLength(val) >= 10, {
      message: minKey,
    })
    .refine((val) => val.length <= 100000, {
      message: maxKey,
    });

// [VALID] Create post schema
export const createPostSchema = z.object({
  body: z.object({
    titleFa: z
      .string({ error: "post.validation.titleFaRequired" })
      .trim()
      .min(3, "post.validation.titleMin")
      .max(200, "post.validation.titleMax"),
    titleEn: z
      .string({ error: "post.validation.titleEnRequired" })
      .trim()
      .min(3, "post.validation.titleMin")
      .max(200, "post.validation.titleMax"),
    contentFa: richTextContent(
      "post.validation.contentFaRequired",
      "post.validation.contentMin",
      "post.validation.contentMax",
    ),
    contentEn: richTextContent(
      "post.validation.contentEnRequired",
      "post.validation.contentMin",
      "post.validation.contentMax",
    ),
    categoryId: z
      .string({ message: "post.validation.categoryIdRequired" })
      .uuid("post.validation.categoryIdInvalid"),
    published: z
      .union([z.boolean(), z.enum(["true", "false"])], {
        message: "post.validation.publishedBoolean",
      })
      .transform((val) => val === true || val === "true")
      .optional(),
  }),
});

// [VALID] Update post schema
export const updatePostSchema = z.object({
  params: z.object({
    id: z.string().uuid("post.validation.idInvalid"),
  }),
  body: z
    .object({
      titleFa: z
        .string()
        .trim()
        .min(3, "post.validation.titleMin")
        .max(200, "post.validation.titleMax")
        .optional(),
      titleEn: z
        .string()
        .trim()
        .min(3, "post.validation.titleMin")
        .max(200, "post.validation.titleMax")
        .optional(),
      contentFa: richTextContent(
        "post.validation.contentFaRequired",
        "post.validation.contentMin",
        "post.validation.contentMax",
      ).optional(),
      contentEn: richTextContent(
        "post.validation.contentEnRequired",
        "post.validation.contentMin",
        "post.validation.contentMax",
      ).optional(),
      categoryId: z
        .string()
        .uuid("post.validation.categoryIdInvalid")
        .optional(),
      published: z
        .union([z.boolean(), z.enum(["true", "false"])], {
          message: "post.validation.publishedBoolean",
        })
        .transform((val) => val === true || val === "true")
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "post.errors.noUpdateData",
    }),
});

// [VALID] Delete post schema
export const deletePostSchema = z.object({
  params: z.object({
    id: z.string().uuid("post.validation.idInvalid"),
  }),
});

// [VALID] Toggle publish post schema
export const togglePublishPostSchema = z.object({
  params: z.object({
    id: z.string().uuid("post.validation.idInvalid"),
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
    page: z.string().regex(/^\d+$/, "post.validation.pageNumber").optional(),
    limit: z.string().regex(/^\d+$/, "post.validation.limitNumber").optional(),
    category: z.string().optional(),
    search: z.string().trim().max(100).optional(),
    sortBy: z.enum(["createdAt", "titleFa", "titleEn"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

// [VALID] Admin list posts schema
export const listPostsAdminSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "post.validation.pageNumber").optional(),
    limit: z.string().regex(/^\d+$/, "post.validation.limitNumber").optional(),
    published: z.enum(["true", "false"]).optional(),
    search: z.string().trim().max(100).optional(),
    sortBy: z.enum(["createdAt", "titleFa", "titleEn"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

// [VALID] Get post by slug schema
export const getPostBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, "post.validation.slugRequired").max(200),
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>["body"];
export type UpdatePostInput = z.infer<typeof updatePostSchema>["body"];
export type ListPostsPublicQuery = z.infer<
  typeof listPostsPublicSchema
>["query"];
export type ListPostsAdminQuery = z.infer<typeof listPostsAdminSchema>["query"];
