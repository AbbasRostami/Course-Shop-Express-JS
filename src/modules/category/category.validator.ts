import { z } from "zod";

// [VALID] Create category schema
export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "نام دسته باید حداقل ۲ کاراکتر باشد")
      .max(50, "نام دسته نباید بیشتر از ۵۰ کاراکتر باشد")
      .trim(),
    description: z
      .string()
      .max(500, "توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد")
      .trim()
      .optional(),
    show: z.boolean().optional().default(true),
  }),
});

// [VALID] Update category schema
export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
  body: z
    .object({
      name: z
        .string()
        .min(2, "نام دسته باید حداقل ۲ کاراکتر باشد")
        .max(50, "نام دسته نباید بیشتر از ۵۰ کاراکتر باشد")
        .trim()
        .optional(),
      description: z
        .string()
        .max(500, "توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد")
        .trim()
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "حداقل یک فیلد برای ویرایش الزامی است",
    }),
});

// [VALID] Delete category schema
export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
});

// [VALID] Get category by slug schema
export const getCategoryBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, "slug الزامی است").max(100),
  }),
});

// [VALID] Toggle visibility schema
export const toggleVisibilitySchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
  body: z.object({
    show: z.boolean({ error: "وضعیت نمایش باید boolean باشد" }),
  }),
});

// [VALID] Admin list categories schema
export const listCategoriesAdminSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
    show: z.enum(["true", "false"]).optional(),
    search: z.string().max(100).optional(),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];
export type ToggleVisibilityInput = z.infer<typeof toggleVisibilitySchema>["body"];
export type ListCategoriesAdminQuery = z.infer<typeof listCategoriesAdminSchema>["query"];