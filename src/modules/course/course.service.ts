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

// [ERROR] Handle duplicate title (P2002)
const handleUniqueError = (error: unknown): never => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError("دوره‌ای با این عنوان قبلاً ثبت شده است", 400, {
      title: "این عنوان قبلاً استفاده شده است",
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
    throw new AppError("دسته‌بندی مورد نظر یافت نشد", 400, {
      categoryId: "این دسته‌بندی وجود ندارد",
    });
  }
};

// [DB] Validate teacher exists
const validateTeacherExists = async (teacherId: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
  });

  if (!teacher) {
    throw new AppError("مدرس مورد نظر یافت نشد", 400, {
      teacherId: "این مدرس وجود ندارد",
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
          title: data.title,
          slug: createSlug(data.title),
          description: data.description,
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
      // [CLEANUP] Remove uploaded image on failure
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
      // [CLEANUP] Remove uploaded image if course not found
      if (data.imageUrl) {
        await removeCloudinaryImage(data.imageUrl);
      }
      throw new AppError("دوره مورد نظر یافت نشد", 404);
    }

    if (data.categoryId) {
      await validateCategoryExists(data.categoryId);
    }
    if (data.teacherId) {
      await validateTeacherExists(data.teacherId);
    }

    const updateData: Prisma.CourseUpdateInput = {};

    // [LOGIC] Auto-generate slug on title change
    if (data.title !== undefined) {
      updateData.title = data.title;
      updateData.slug = createSlug(data.title);
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.published !== undefined) updateData.published = data.published;
    if (data.categoryId !== undefined) {
      updateData.category = { connect: { id: data.categoryId } };
    }
    if (data.teacherId !== undefined) {
      updateData.teacher = { connect: { id: data.teacherId } };
    }
    if (data.imageUrl) {
      updateData.imageUrl = data.imageUrl;
    }

    try {
      const course = await prisma.course.update({
        where: { id },
        data: updateData,
        include: courseInclude,
      });

      // [CLEANUP] Remove old image after successful update
      if (data.imageUrl && existing.imageUrl) {
        await removeCloudinaryImage(existing.imageUrl);
      }

      return formatCourse(course);
    } catch (error) {
      // [CLEANUP] Remove uploaded image on failure
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
      throw new AppError("دوره مورد نظر یافت نشد", 404);
    }

    // [LOGIC] Prevent redundant toggle
    if (existing.published === published) {
      throw new AppError(
        published ? "دوره از قبل منتشر شده است" : "دوره از قبل پنهان است",
        400,
      );
    }

    // [LOGIC] Block publish if category is hidden
    if (published && existing.category && !existing.category.show) {
      throw new AppError(
        "نمی‌توان دوره را منتشر کرد چون دسته‌بندی آن غیرفعال است",
        400,
      );
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
      throw new AppError("دوره مورد نظر یافت نشد", 404);
    }

    await prisma.course.delete({ where: { id } });

    // [CLEANUP] Remove image from Cloudinary
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
        slug: { in: query.categories },
        show: true,
      };
    }

    if (query.level) where.level = query.level;

    // [LOGIC] Price range filter
    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = Number(query.minPrice);
      if (query.maxPrice) where.price.lte = Number(query.maxPrice);
    }

    if (query.search) {
      where.AND = [
        {
          OR: [
            { title: { contains: query.search, mode: "insensitive" } },
            { description: { contains: query.search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const sortBy = query.sortBy || "createdAt";
    const order = query.order || "desc";
    const orderBy = { [sortBy]: order };

    const [items, total] = await Promise.all([
      prisma.course.findMany({ where, skip, take, orderBy, include: courseInclude }),
      prisma.course.count({ where }),
    ]);

    const formattedCourses = formatCourses(items);
    const courseIds = formattedCourses.map((c) => c.id);

    // [DB] Load enrollment, reactions, favorites in parallel
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
      where.category = { slug: { in: query.categories } };
    }

    if (query.level) where.level = query.level;

    if (query.published !== undefined) {
      where.published = query.published === "true";
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const sortBy = query.sortBy || "createdAt";
    const order = query.order || "desc";
    const orderBy = { [sortBy]: order };

    const [items, total] = await Promise.all([
      prisma.course.findMany({ where, skip, take, orderBy, include: courseInclude }),
      prisma.course.count({ where }),
    ]);

    return {
      items: formatCourses(items),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Get single course by slug with user context
  async getCourseBySlug(slug: string, userId?: string) {
    const course = await prisma.course.findFirst({
      where: {
        slug,
        published: true,
        category: { show: true },
      },
      include: courseInclude,
    });

    if (!course) {
      throw new AppError("دوره مورد نظر یافت نشد", 404);
    }

    const formattedCourse = formatCourse(course);

    // [DB] Load enrollment, reactions, favorite in parallel
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