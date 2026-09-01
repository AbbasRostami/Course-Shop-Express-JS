import { z } from "zod";

// [VALID] Create teacher schema
export const createTeacherSchema = z.object({
  body: z.object({
    name: z
      .string({ message: "نام مدرس الزامی است" })
      .min(2, "نام مدرس باید حداقل ۲ کاراکتر باشد")
      .max(100, "نام مدرس نباید بیشتر از ۱۰۰ کاراکتر باشد")
      .trim(),
    bio: z
      .string()
      .max(2000, "بیوگرافی نباید بیشتر از ۲۰۰۰ کاراکتر باشد")
      .trim()
      .optional(),
  }),
});

// [VALID] Update teacher schema
export const updateTeacherSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, "نام مدرس باید حداقل ۲ کاراکتر باشد")
      .max(100, "نام مدرس نباید بیشتر از ۱۰۰ کاراکتر باشد")
      .trim()
      .optional(),
    bio: z
      .string()
      .max(2000, "بیوگرافی نباید بیشتر از ۲۰۰۰ کاراکتر باشد")
      .trim()
      .nullable()
      .optional(),
  }),
});

// [VALID] Delete teacher schema
export const deleteTeacherSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
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