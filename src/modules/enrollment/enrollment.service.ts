import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import {
  enrollmentInclude,
  EnrollmentWithRelations,
} from "./enrollment.types.js";
import { ListMyCoursesQuery } from "./enrollment.validator.js";

// [UTIL] Format enrollment for response
const formatEnrollment = (item: EnrollmentWithRelations) => {
  const { _count, ...courseRest } = item.course;
  return {
    id: item.id,
    pricePaid: item.pricePaid,
    enrolledAt: item.createdAt,
    course: {
      ...courseRest,
      stats: _count,
    },
  };
};

export const enrollmentService = {
  // [DB] Enroll user in free course
  async enroll(userId: string, slug: string) {
    const course = await prisma.course.findFirst({
      where: {
        slug,
        published: true,
        category: { show: true },
      },
    });

    if (!course) {
      throw new AppError("دوره مورد نظر یافت نشد", 404);
    }

    // [DB] Check for existing enrollment
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId: course.id },
      },
    });

    if (existingEnrollment) {
      throw new AppError("شما قبلاً در این دوره ثبت‌نام کرده‌اید", 400);
    }

    // [LOGIC] Block direct enrollment for paid courses
    if (course.price > 0) {
      throw new AppError(
        "برای خرید دوره‌های پولی از سبد خرید استفاده کنید",
        400,
      );
    }

    // [DB] Create free enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId: course.id,
        pricePaid: 0,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
            price: true,
          },
        },
      },
    });

    return {
      enrollment,
      message: "با موفقیت در دوره رایگان ثبت‌نام شدید",
    };
  },

  // [DB] Get user's enrolled courses with pagination
  async getMyEnrollments(userId: string, query: ListMyCoursesQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const [items, total] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: enrollmentInclude,
      }),
      prisma.enrollment.count({ where: { userId } }),
    ]);

    return {
      items: items.map(formatEnrollment),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },
};