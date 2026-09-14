import { z } from "zod";

// [VALID] Create category schema
export const createCategorySchema = z.object({
  body: z.object({
    nameFa: z
      .string({ message: "category.validation.nameFaRequired" })
      .trim()
      .min(2, "category.validation.nameMin")
      .max(50, "category.validation.nameMax"),
    nameEn: z
      .string({ message: "category.validation.nameEnRequired" })
      .trim()
      .min(2, "category.validation.nameMin")
      .max(50, "category.validation.nameMax"),
    descriptionFa: z
      .string()
      .trim()
      .max(500, "category.validation.descriptionMax")
      .optional(),
    descriptionEn: z
      .string()
      .trim()
      .max(500, "category.validation.descriptionMax")
      .optional(),
    show: z.boolean().optional().default(true),
  }),
});

// [VALID] Update category schema
export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid("category.validation.idInvalid"),
  }),
  body: z
    .object({
      nameFa: z
        .string()
        .trim()
        .min(2, "category.validation.nameMin")
        .max(50, "category.validation.nameMax")
        .optional(),
      nameEn: z
        .string()
        .trim()
        .min(2, "category.validation.nameMin")
        .max(50, "category.validation.nameMax")
        .optional(),
      descriptionFa: z
        .string()
        .trim()
        .max(500, "category.validation.descriptionMax")
        .optional(),
      descriptionEn: z
        .string()
        .trim()
        .max(500, "category.validation.descriptionMax")
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "category.errors.noUpdateData",
    }),
});

// [VALID] Delete category schema
export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid("category.validation.idInvalid"),
  }),
});

// [VALID] Get category by slug schema
export const getCategoryBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, "category.validation.slugRequired").max(100),
  }),
});

// [VALID] Toggle visibility schema
export const toggleVisibilitySchema = z.object({
  params: z.object({
    id: z.string().uuid("category.validation.idInvalid"),
  }),
  body: z.object({
    show: z.boolean({ error: "category.validation.showBoolean" }),
  }),
});

// [VALID] Admin list categories schema
export const listCategoriesAdminSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, "category.validation.pageNumber")
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, "category.validation.limitNumber")
      .optional(),
    show: z.enum(["true", "false"]).optional(),
    search: z.string().max(100).optional(),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];
export type ToggleVisibilityInput = z.infer<
  typeof toggleVisibilitySchema
>["body"];
export type ListCategoriesAdminQuery = z.infer<
  typeof listCategoriesAdminSchema
>["query"];
