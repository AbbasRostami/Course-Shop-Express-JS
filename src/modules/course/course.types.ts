import { Prisma } from "../../../generated/prisma/client.js";
import { CreateCourseInput, UpdateCourseInput } from "./course.validator.js";

// [TYPE] Create input with optional image URL
export type CreateCourseInputWithImage = CreateCourseInput & {
  imageUrl?: string;
};

// [TYPE] Update input with optional image URL
export type UpdateCourseInputWithImage = UpdateCourseInput & {
  imageUrl?: string;
};

// [DB] Include enrollment and comment counts
export const courseWithCount = {
  _count: {
    select: {
      enrollments: true,
      comments: true,
    },
  },
} satisfies Prisma.CourseInclude;

// [DB] Include category info only (bilingual)
export const courseWithCategory = {
  category: {
    select: {
      id: true,
      nameFa: true,
      nameEn: true,
      slugFa: true,
      slugEn: true,
    },
  },
} satisfies Prisma.CourseInclude;

// [DB] Full course include - category, teacher, counts (bilingual)
export const courseInclude = {
  category: {
    select: {
      id: true,
      nameFa: true,
      nameEn: true,
      slugFa: true,
      slugEn: true,
    },
  },
  teacher: {
    select: {
      id: true,
      nameFa: true,
      nameEn: true,
      slugFa: true,
      slugEn: true,
      avatar: true,
    },
  },
  _count: {
    select: {
      enrollments: true,
      comments: true,
    },
  },
} satisfies Prisma.CourseInclude;

export type CourseWithRelations = Prisma.CourseGetPayload<{
  include: typeof courseInclude;
}>;

// [TYPE] Formatted course with stats replacing _count
export type CourseWithStats = Omit<
  CourseWithRelations,
  "_count" | "categoryId" | "teacherId"
> & {
  stats: {
    enrollments: number;
    comments: number;
  };
};
