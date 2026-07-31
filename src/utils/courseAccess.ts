import { prisma } from "../lib/prisma.js";

// [DB] Check if user is enrolled in course
export const hasCourseAccess = async (
  userId: string,
  courseId: string,
): Promise<boolean> => {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
    select: { id: true },
  });

  return !!enrollment;
};