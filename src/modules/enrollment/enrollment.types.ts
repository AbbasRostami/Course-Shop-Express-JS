import { Prisma } from "../../../generated/prisma/client.js";

// [DB] Enrollment include with course, category, teacher and counts
export const enrollmentInclude = {
  course: {
    include: {
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
    },
  },
} satisfies Prisma.EnrollmentInclude;

// [TYPE] Enrollment with relations payload
export type EnrollmentWithRelations = Prisma.EnrollmentGetPayload<{
  include: typeof enrollmentInclude;
}>;