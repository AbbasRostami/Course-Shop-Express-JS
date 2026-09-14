import { z } from "zod";

// [VALID] Create teacher schema
export const createTeacherSchema = z.object({
  body: z.object({
    nameFa: z
      .string({ message: "teacher.validation.nameFaRequired" })
      .trim()
      .min(2, "teacher.validation.nameMin")
      .max(100, "teacher.validation.nameMax"),
    nameEn: z
      .string({ message: "teacher.validation.nameEnRequired" })
      .trim()
      .min(2, "teacher.validation.nameMin")
      .max(100, "teacher.validation.nameMax"),
    bioFa: z.string().trim().max(2000, "teacher.validation.bioMax").optional(),
    bioEn: z.string().trim().max(2000, "teacher.validation.bioMax").optional(),
  }),
});

// [VALID] Update teacher schema
export const updateTeacherSchema = z.object({
  params: z.object({
    id: z.string().uuid("teacher.validation.idInvalid"),
  }),
  body: z.object({
    nameFa: z
      .string()
      .trim()
      .min(2, "teacher.validation.nameMin")
      .max(100, "teacher.validation.nameMax")
      .optional(),
    nameEn: z
      .string()
      .trim()
      .min(2, "teacher.validation.nameMin")
      .max(100, "teacher.validation.nameMax")
      .optional(),
    bioFa: z
      .string()
      .trim()
      .max(2000, "teacher.validation.bioMax")
      .nullable()
      .optional(),
    bioEn: z
      .string()
      .trim()
      .max(2000, "teacher.validation.bioMax")
      .nullable()
      .optional(),
  }),
});

// [VALID] Delete teacher schema
export const deleteTeacherSchema = z.object({
  params: z.object({
    id: z.string().uuid("teacher.validation.idInvalid"),
  }),
});

// [VALID] Get teacher by slug schema
export const getTeacherBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1).max(200),
  }),
});

// [VALID] List teachers schema
export const listTeachersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().max(100).optional(),
  }),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>["body"];
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>["body"];
export type ListTeachersQuery = z.infer<typeof listTeachersSchema>["query"];
