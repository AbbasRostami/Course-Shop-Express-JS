import { z } from "zod";

// [VALID] Create comment schema
export const createCommentSchema = z.object({
  body: z
    .object({
      content: z
        .string({ error: "comment.validation.contentRequired" })
        .min(2, "comment.validation.contentMin")
        .max(1000, "comment.validation.contentMax")
        .trim(),
      courseId: z
        .string()
        .uuid("comment.validation.courseIdInvalid")
        .optional(),
      postId: z.string().uuid("comment.validation.postIdInvalid").optional(),
      parentId: z
        .string()
        .uuid("comment.validation.parentIdInvalid")
        .optional(),
    })
    .superRefine((data, ctx) => {
      const hasCourseId = !!data.courseId;
      const hasPostId = !!data.postId;

      // [LOGIC] Require exactly one of courseId or postId
      if (!hasCourseId && !hasPostId) {
        ctx.addIssue({
          code: "custom",
          path: ["courseId"],
          message: "comment.validation.eitherCourseOrPost",
        });
      }

      if (hasCourseId && hasPostId) {
        ctx.addIssue({
          code: "custom",
          path: ["courseId"],
          message: "comment.validation.onlyOneAllowed",
        });

        ctx.addIssue({
          code: "custom",
          path: ["postId"],
          message: "comment.validation.onlyOneAllowed",
        });
      }
    }),
});

// [VALID] Delete comment schema
export const deleteCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid("comment.validation.idInvalid"),
  }),
});

// [VALID] List course comments schema
export const listCourseCommentsSchema = z.object({
  params: z.object({
    slug: z
      .string({ error: "comment.validation.slugRequired" })
      .min(1, "comment.validation.slugInvalid")
      .max(200),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/, "comment.validation.pageNumber").optional(),
    limit: z
      .string()
      .regex(/^\d+$/, "comment.validation.limitNumber")
      .optional(),
  }),
});

// [VALID] List my comments schema
export const listMyCommentsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "comment.validation.pageNumber").optional(),
    limit: z
      .string()
      .regex(/^\d+$/, "comment.validation.limitNumber")
      .optional(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  }),
});

// [VALID] Admin list comments schema
export const listAdminCommentsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "comment.validation.pageNumber").optional(),
    limit: z
      .string()
      .regex(/^\d+$/, "comment.validation.limitNumber")
      .optional(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    search: z
      .string()
      .trim()
      .max(100, "comment.validation.searchMax")
      .optional(),
  }),
});

// [VALID] Moderate comment schema
export const moderateCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid("comment.validation.idInvalid"),
  }),
});

// [VALID] List post comments schema
export const listPostCommentsSchema = z.object({
  params: z.object({
    slug: z
      .string({ error: "comment.validation.slugRequired" })
      .min(1, "comment.validation.slugInvalid")
      .max(200),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/, "comment.validation.pageNumber").optional(),
    limit: z
      .string()
      .regex(/^\d+$/, "comment.validation.limitNumber")
      .optional(),
  }),
});

export type ListPostCommentsQuery = z.infer<
  typeof listPostCommentsSchema
>["query"];
export type CreateCommentInput = z.infer<typeof createCommentSchema>["body"];
export type ListCourseCommentsQuery = z.infer<
  typeof listCourseCommentsSchema
>["query"];
export type ListMyCommentsQuery = z.infer<typeof listMyCommentsSchema>["query"];
export type ListAdminCommentsQuery = z.infer<
  typeof listAdminCommentsSchema
>["query"];
