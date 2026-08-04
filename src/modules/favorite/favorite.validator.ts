import { z } from "zod";

// [VALID] Toggle course favorite schema
export const toggleCourseFavoriteSchema = z.object({
  params: z.object({
    courseId: z.string().uuid("شناسه دوره نامعتبر است"),
  }),
});

// [VALID] Toggle post favorite schema
export const togglePostFavoriteSchema = z.object({
  params: z.object({
    postId: z.string().uuid("شناسه پست نامعتبر است"),
  }),
});

// [VALID] List favorites pagination schema
export const listFavoritesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
  }),
});

export type ListFavoritesQuery = z.infer<typeof listFavoritesSchema>["query"];