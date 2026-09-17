import { z } from "zod";

// [VALID] Enroll by course slug schema
export const enrollSchema = z.object({
  params: z.object({
    slug: z
      .string({ error: "enrollment.validation.slugRequired" })
      .min(1, "enrollment.validation.slugInvalid")
      .max(200),
  }),
});

// [VALID] List my courses schema
export const listMyCoursesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "enrollment.validation.pageNumber").optional(),
    limit: z.string().regex(/^\d+$/, "enrollment.validation.limitNumber").optional(),
  }),
});

export type ListMyCoursesQuery = z.infer<typeof listMyCoursesSchema>["query"];