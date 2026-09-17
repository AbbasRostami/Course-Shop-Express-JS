import { z } from "zod";

// [VALID] Toggle course favorite schema
export const toggleCourseFavoriteSchema = z.object({
  params: z.object({
    courseId: z.string().uuid("favorite.validation.courseIdInvalid"),
  }),
});

// [VALID] Toggle post favorite schema
export const togglePostFavoriteSchema = z.object({
  params: z.object({
    postId: z.string().uuid("favorite.validation.postIdInvalid"),
  }),
});

// [VALID] List favorites pagination schema
export const listFavoritesSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, "favorite.validation.pageNumber")
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, "favorite.validation.limitNumber")
      .optional(),
  }),
});

export type ListFavoritesQuery = z.infer<typeof listFavoritesSchema>["query"];
