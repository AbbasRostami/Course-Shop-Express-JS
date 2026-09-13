import { z } from "zod";

// [VALID] Course level enum
const courseLevelEnum = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"], {
  error: "course.validation.levelInvalid",
});

// [VALID] Coerce price to integer
const coerceNumber = z.coerce
  .number({ error: "course.validation.priceType" })
  .int("course.validation.priceInt")
  .min(0, "course.validation.priceMin")
  .max(1000000000, "course.validation.priceMax");

// [VALID] Coerce boolean
const coerceBoolean = z.preprocess(
  (val) => {
    if (val === "true" || val === true) return true;
    if (val === "false" || val === false) return false;
    return val;
  },
  z.boolean({ error: "course.validation.publishedBoolean" }),
);

// [VALID] Normalize category slugs to array
const categoriesSchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((val) => {
    if (!val) return undefined;
    return Array.isArray(val) ? val : [val];
  });

// [VALID] Create course schema
export const createCourseSchema = z.object({
  body: z.object({
    titleFa: z
      .string({ error: "course.validation.titleRequired" })
      .trim()
      .min(3, "course.validation.titleMin")
      .max(150, "course.validation.titleMax"),
    titleEn: z
      .string({ error: "course.validation.titleRequired" })
      .trim()
      .min(3, "course.validation.titleMin")
      .max(150, "course.validation.titleMax"),
    descriptionFa: z
      .string()
      .trim()
      .max(5000, "course.validation.descriptionMax")
      .optional(),
    descriptionEn: z
      .string()
      .trim()
      .max(5000, "course.validation.descriptionMax")
      .optional(),
    price: coerceNumber,
    teacherId: z
      .string({ message: "course.validation.teacherIdRequired" })
      .uuid("course.validation.teacherIdInvalid"),
    level: courseLevelEnum.optional().default("BEGINNER"),
    categoryId: z
      .string({ message: "course.validation.categoryIdRequired" })
      .uuid("course.validation.categoryIdInvalid"),
    published: coerceBoolean.optional().default(false),
  }),
});

// [VALID] Update course schema
export const updateCourseSchema = z.object({
  params: z.object({
    id: z.string().uuid("course.validation.idInvalid"),
  }),
  body: z.object({
    titleFa: z
      .string()
      .trim()
      .min(3, "course.validation.titleMin")
      .max(150, "course.validation.titleMax")
      .optional(),
    titleEn: z
      .string()
      .trim()
      .min(3, "course.validation.titleMin")
      .max(150, "course.validation.titleMax")
      .optional(),
    descriptionFa: z
      .string()
      .trim()
      .max(5000, "course.validation.descriptionMax")
      .optional(),
    descriptionEn: z
      .string()
      .trim()
      .max(5000, "course.validation.descriptionMax")
      .optional(),
    teacherId: z.string().uuid("course.validation.teacherIdInvalid").optional(),
    price: coerceNumber.optional(),
    level: courseLevelEnum.optional(),
    categoryId: z
      .string()
      .uuid("course.validation.categoryIdInvalid")
      .optional(),
    published: coerceBoolean.optional(),
  }),
});

// [VALID] Delete course schema
export const deleteCourseSchema = z.object({
  params: z.object({
    id: z.string().uuid("course.validation.idInvalid"),
  }),
});

// [VALID] Toggle publish schema
export const togglePublishSchema = z.object({
  params: z.object({
    id: z.string().uuid("course.validation.idInvalid"),
  }),
  body: z.object({
    published: z.boolean({ error: "course.validation.publishedBoolean" }),
  }),
});

// [VALID] Get course by slug schema
export const getCourseBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, "course.validation.slugRequired").max(200),
  }),
});

// [VALID] Public list courses schema
export const listCoursesPublicSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "course.validation.pageNumber").optional(),
    limit: z.string().regex(/^\d+$/, "course.validation.limitNumber").optional(),
    categories: categoriesSchema,
    level: courseLevelEnum.optional(),
    minPrice: z
      .string()
      .regex(/^\d+$/, "course.validation.minPriceNumber")
      .optional(),
    maxPrice: z
      .string()
      .regex(/^\d+$/, "course.validation.maxPriceNumber")
      .optional(),
    search: z.string().max(100).optional(),
    sortBy: z.enum(["createdAt", "price", "titleFa", "titleEn"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

// [VALID] Admin list courses schema
export const listCoursesAdminSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "course.validation.pageNumber").optional(),
    limit: z.string().regex(/^\d+$/, "course.validation.limitNumber").optional(),
    categories: categoriesSchema,
    level: courseLevelEnum.optional(),
    published: z.enum(["true", "false"]).optional(),
    search: z.string().max(100).optional(),
    sortBy: z.enum(["createdAt", "price", "titleFa", "titleEn"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>["body"];
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>["body"];
export type TogglePublishInput = z.infer<typeof togglePublishSchema>["body"];
export type ListCoursesPublicQuery = z.infer<
  typeof listCoursesPublicSchema
>["query"];
export type ListCoursesAdminQuery = z.infer<
  typeof listCoursesAdminSchema
>["query"];