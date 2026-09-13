import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { removeCloudinaryImage } from "../../utils/cloudinary.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import {
  getMyReaction,
  getReactionCounts,
  getReactionCountsForList,
} from "../../utils/reactionHelper.js";
import { createSlug } from "../../utils/slug.js";
import {
  courseInclude,
  CourseWithRelations,
  CourseWithStats,
  CreateCourseInputWithImage,
  UpdateCourseInputWithImage,
} from "./course.types.js";
import {
  ListCoursesAdminQuery,
  ListCoursesPublicQuery,
} from "./course.validator.js";

// [UTIL] Format course - replace _count with stats
const formatCourse = (course: CourseWithRelations) => {
  const { _count, categoryId, teacherId, ...rest } = course;
  return {
    ...rest,
    stats: {
      enrollments: _count.enrollments,
      comments: _count.comments,
    },
  };
};

// [UTIL] Format course list
const formatCourses = (courses: CourseWithRelations[]): CourseWithStats[] =>
  courses.map(formatCourse);

// [ERROR] Handle duplicate title/slug (P2002)
const handleUniqueError = (error: unknown): never => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError("course.errors.titleExists", 400, {
      title: "course.errors.titleExists",
    });
  }
  throw error;
};

// [DB] Validate category exists
const validateCategoryExists = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError("course.errors.categoryNotFound", 400, {
      categoryId: "course.errors.categoryNotFound",
    });
  }
};

// [DB] Validate teacher exists
const validateTeacherExists = async (teacherId: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
  });

  if (!teacher) {
    throw new AppError("course.errors.teacherNotFound", 400, {
      teacherId: "course.errors.teacherNotFound",
    });
  }
};

export const courseService = {
  // [DB] Create new course
  async createCourse(data: CreateCourseInputWithImage) {
    await validateCategoryExists(data.categoryId);
    await validateTeacherExists(data.teacherId);

    try {
      const course = await prisma.course.create({
        data: {
          titleFa: data.titleFa,
          titleEn: data.titleEn,
          slugFa: createSlug(data.titleFa),
          slugEn: createSlug(data.titleEn),
          descriptionFa: data.descriptionFa,
          descriptionEn: data.descriptionEn,
          price: data.price,
          level: data.level,
          imageUrl: data.imageUrl,
          categoryId: data.categoryId,
          teacherId: data.teacherId,
          published: data.published,
        },
        include: courseInclude,
      });

      return formatCourse(course);
    } catch (error) {
      if (data.imageUrl) {
        await removeCloudinaryImage(data.imageUrl);
      }
      handleUniqueError(error);
      throw error;
    }
  },

  // [DB] Update existing course
  async updateCourse(id: string, data: UpdateCourseInputWithImage) {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      if (data.imageUrl) {
        await removeCloudinaryImage(data.imageUrl);
      }
      throw new AppError("course.errors.notFound", 404);
    }

    if (data.categoryId) await validateCategoryExists(data.categoryId);
    if (data.teacherId) await validateTeacherExists(data.teacherId);

    const updateData: Prisma.CourseUpdateInput = {};

    // [LOGIC] Auto-generate slug on title change
    if (data.titleFa !== undefined) {
      updateData.titleFa = data.titleFa;
      updateData.slugFa = createSlug(data.titleFa);
    }
    if (data.titleEn !== undefined) {
      updateData.titleEn = data.titleEn;
      updateData.slugEn = createSlug(data.titleEn);
    }
    if (data.descriptionFa !== undefined)
      updateData.descriptionFa = data.descriptionFa;
    if (data.descriptionEn !== undefined)
      updateData.descriptionEn = data.descriptionEn;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.published !== undefined) updateData.published = data.published;
    if (data.categoryId !== undefined) {
      updateData.category = { connect: { id: data.categoryId } };
    }
    if (data.teacherId !== undefined) {
      updateData.teacher = { connect: { id: data.teacherId } };
    }
    if (data.imageUrl) updateData.imageUrl = data.imageUrl;

    try {
      const course = await prisma.course.update({
        where: { id },
        data: updateData,
        include: courseInclude,
      });

      if (data.imageUrl && existing.imageUrl) {
        await removeCloudinaryImage(existing.imageUrl);
      }

      return formatCourse(course);
    } catch (error) {
      if (data.imageUrl) {
        await removeCloudinaryImage(data.imageUrl);
      }
      handleUniqueError(error);
      throw error;
    }
  },

  // [DB] Toggle course publish status
  async togglePublish(id: string, published: boolean) {
    const existing = await prisma.course.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!existing) {
      throw new AppError("course.errors.notFound", 404);
    }

    if (existing.published === published) {
      throw new AppError(
        published
          ? "course.errors.alreadyPublished"
          : "course.errors.alreadyHidden",
        400,
      );
    }

    if (published && existing.category && !existing.category.show) {
      throw new AppError("course.errors.categoryHidden", 400);
    }

    const course = await prisma.course.update({
      where: { id },
      data: { published },
      include: courseInclude,
    });

    return formatCourse(course);
  },

  // [DB] Delete course and remove image
  async deleteCourse(id: string) {
    const existing = await prisma.course.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError("course.errors.notFound", 404);
    }

    await prisma.course.delete({ where: { id } });

    if (existing.imageUrl) {
      await removeCloudinaryImage(existing.imageUrl);
    }
  },

  // [DB] Get public courses with filters and user context
  async getPublicCourses(query: ListCoursesPublicQuery, userId?: string) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.CourseWhereInput = {
      published: true,
      category: { show: true },
    };

    if (query.categories && query.categories.length > 0) {
      where.category = {
        OR: [
          { slugFa: { in: query.categories } },
          { slugEn: { in: query.categories } },
        ],
        show: true,
      };
    }

    if (query.level) where.level = query.level;

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = Number(query.minPrice);
      if (query.maxPrice) where.price.lte = Number(query.maxPrice);
    }

    // [LOGIC] Bilingual search (Fa + En)
    if (query.search) {
      where.AND = [
        {
          OR: [
            { titleFa: { contains: query.search, mode: "insensitive" } },
            { titleEn: { contains: query.search, mode: "insensitive" } },
            { descriptionFa: { contains: query.search, mode: "insensitive" } },
            { descriptionEn: { contains: query.search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const sortBy = query.sortBy || "createdAt";
    const order = query.order || "desc";
    const orderBy = { [sortBy]: order };

    const [items, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take,
        orderBy,
        include: courseInclude,
      }),
      prisma.course.count({ where }),
    ]);

    const formattedCourses = formatCourses(items);
    const courseIds = formattedCourses.map((c) => c.id);

    const [enrolledIds, reactionMap, favoriteIds] = await Promise.all([
      userId && courseIds.length > 0
        ? prisma.enrollment
            .findMany({
              where: { userId, courseId: { in: courseIds } },
              select: { courseId: true },
            })
            .then((e) => new Set(e.map((x) => x.courseId)))
        : Promise.resolve(new Set<string>()),

      getReactionCountsForList("courseId", courseIds, userId),

      userId && courseIds.length > 0
        ? prisma.courseFavorite
            .findMany({
              where: { userId, courseId: { in: courseIds } },
              select: { courseId: true },
            })
            .then((f) => new Set(f.map((x) => x.courseId)))
        : Promise.resolve(new Set<string>()),
    ]);

    const finalItems = formattedCourses.map((course) => ({
      ...course,
      isEnrolled: enrolledIds.has(course.id),
      reactions: reactionMap.get(course.id) ?? {
        likes: 0,
        dislikes: 0,
        myReaction: null,
      },
      isFavorite: favoriteIds.has(course.id),
    }));

    return {
      items: finalItems,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Admin get all courses with filters
  async getAdminCourses(query: ListCoursesAdminQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.CourseWhereInput = {};

    if (query.categories && query.categories.length > 0) {
      where.category = {
        OR: [
          { slugFa: { in: query.categories } },
          { slugEn: { in: query.categories } },
        ],
      };
    }

    if (query.level) where.level = query.level;

    if (query.published !== undefined) {
      where.published = query.published === "true";
    }

    if (query.search) {
      where.OR = [
        { titleFa: { contains: query.search, mode: "insensitive" } },
        { titleEn: { contains: query.search, mode: "insensitive" } },
        { descriptionFa: { contains: query.search, mode: "insensitive" } },
        { descriptionEn: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const sortBy = query.sortBy || "createdAt";
    const order = query.order || "desc";
    const orderBy = { [sortBy]: order };

    const [items, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take,
        orderBy,
        include: courseInclude,
      }),
      prisma.course.count({ where }),
    ]);

    return {
      items: formatCourses(items),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Get single course by slug (Fa or En) with user context
  async getCourseBySlug(slug: string, userId?: string) {
    const course = await prisma.course.findFirst({
      where: {
        OR: [{ slugFa: slug }, { slugEn: slug }],
        published: true,
        category: { show: true },
      },
      include: courseInclude,
    });

    if (!course) {
      throw new AppError("course.errors.notFound", 404);
    }

    const formattedCourse = formatCourse(course);

    const [enrollment, counts, myReaction, favorite] = await Promise.all([
      userId
        ? prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId: course.id } },
            select: { id: true, pricePaid: true, createdAt: true },
          })
        : Promise.resolve(null),
      getReactionCounts("courseId", course.id),
      getMyReaction("courseId", course.id, userId),
      userId
        ? prisma.courseFavorite.findUnique({
            where: { userId_courseId: { userId, courseId: course.id } },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    return {
      ...formattedCourse,
      isEnrolled: !!enrollment,
      enrollment: enrollment || null,
      reactions: { ...counts, myReaction },
      isFavorite: !!favorite,
    };
  },
};