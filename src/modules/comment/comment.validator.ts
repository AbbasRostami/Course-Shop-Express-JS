import { z } from "zod";

// [VALID] Create comment schema
export const createCommentSchema = z.object({
  body: z
    .object({
      content: z
        .string({ error: "محتوای کامنت الزامی است" })
        .min(2, "کامنت باید حداقل ۲ کاراکتر باشد")
        .max(1000, "کامنت نباید بیشتر از ۱۰۰۰ کاراکتر باشد")
        .trim(),
      courseId: z.string().uuid("شناسه دوره نامعتبر است").optional(),
      postId: z.string().uuid("شناسه پست نامعتبر است").optional(),
      parentId: z.string().uuid("شناسه کامنت parent نامعتبر است").optional(),
    })
    .superRefine((data, ctx) => {
      const hasCourseId = !!data.courseId;
      const hasPostId = !!data.postId;

      // [LOGIC] Require exactly one of courseId or postId
      if (!hasCourseId && !hasPostId) {
        ctx.addIssue({
          code: "custom",
          path: ["courseId"],
          message: "ارسال یکی از courseId یا postId الزامی است",
        });
      }

      if (hasCourseId && hasPostId) {
        ctx.addIssue({
          code: "custom",
          path: ["courseId"],
          message: "فقط یکی از courseId یا postId مجاز است",
        });

        ctx.addIssue({
          code: "custom",
          path: ["postId"],
          message: "فقط یکی از courseId یا postId مجاز است",
        });
      }
    }),
});

// [VALID] Delete comment schema
export const deleteCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
});

// [VALID] List course comments schema
export const listCourseCommentsSchema = z.object({
  params: z.object({
    slug: z
      .string({ error: "slug الزامی است" })
      .min(1, "slug نامعتبر است")
      .max(200),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
  }),
});

// [VALID] List my comments schema
export const listMyCommentsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  }),
});

// [VALID] Admin list comments schema
export const listAdminCommentsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    search: z.string().trim().max(100, "search حداکثر ۱۰۰ کاراکتر").optional(),
  }),
});

// [VALID] Moderate comment schema
export const moderateCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
});

// [VALID] List post comments schema
export const listPostCommentsSchema = z.object({
  params: z.object({
    slug: z
      .string({ error: "slug الزامی است" })
      .min(1, "slug نامعتبر است")
      .max(200),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
  }),
});

export type ListPostCommentsQuery = z.infer<typeof listPostCommentsSchema>["query"];
export type CreateCommentInput = z.infer<typeof createCommentSchema>["body"];
export type ListCourseCommentsQuery = z.infer<typeof listCourseCommentsSchema>["query"];
export type ListMyCommentsQuery = z.infer<typeof listMyCommentsSchema>["query"];
export type ListAdminCommentsQuery = z.infer<typeof listAdminCommentsSchema>["query"];