import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import {
  courseFavoriteInclude,
  CourseFavoriteWithRelations,
  postFavoriteInclude,
  PostFavoriteWithRelations,
} from "./favorite.types.js";
import { ListFavoritesQuery } from "./favorite.validator.js";

// [UTIL] Format course favorite for response
const formatCourseFavorite = (item: CourseFavoriteWithRelations) => {
  const { _count, categoryId, ...courseRest } = item.course;
  return {
    id: item.id,
    savedAt: item.createdAt,
    course: {
      ...courseRest,
      stats: _count,
    },
  };
};

// [UTIL] Format post favorite for response
const formatPostFavorite = (item: PostFavoriteWithRelations) => {
  const { _count, categoryId, ...postRest } = item.post;
  return {
    id: item.id,
    savedAt: item.createdAt,
    post: {
      ...postRest,
      stats: _count,
    },
  };
};

export const favoriteService = {
  // [DB] Toggle course favorite - add or remove
  async toggleCourseFavorite(userId: string, courseId: string) {
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        published: true,
        category: { show: true },
      },
      select: { id: true, title: true },
    });

    if (!course) {
      throw new AppError("دوره مورد نظر یافت نشد", 404);
    }

    const existing = await prisma.courseFavorite.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    // [LOGIC] Remove if exists
    if (existing) {
      await prisma.courseFavorite.delete({
        where: { userId_courseId: { userId, courseId } },
      });

      return {
        message: "دوره از علاقه‌مندی‌ها حذف شد",
        isFavorite: false,
      };
    }

    // [DB] Add to favorites
    await prisma.courseFavorite.create({
      data: { userId, courseId },
    });

    return {
      message: "دوره به علاقه‌مندی‌ها اضافه شد",
      isFavorite: true,
    };
  },

  // [DB] Get user's course favorites with pagination
  async getMyCourseFavorites(userId: string, query: ListFavoritesQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const [items, total] = await Promise.all([
      prisma.courseFavorite.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: courseFavoriteInclude,
      }),
      prisma.courseFavorite.count({ where: { userId } }),
    ]);

    return {
      items: items.map(formatCourseFavorite),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Toggle post favorite - add or remove
  async togglePostFavorite(userId: string, postId: string) {
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        published: true,
        category: { show: true },
      },
      select: { id: true, title: true },
    });

    if (!post) {
      throw new AppError("پست مورد نظر یافت نشد", 404);
    }

    const existing = await prisma.blogFavorite.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    // [LOGIC] Remove if exists
    if (existing) {
      await prisma.blogFavorite.delete({
        where: { userId_postId: { userId, postId } },
      });

      return {
        message: "پست از علاقه‌مندی‌ها حذف شد",
        isFavorite: false,
      };
    }

    // [DB] Add to favorites
    await prisma.blogFavorite.create({
      data: { userId, postId },
    });

    return {
      message: "پست به علاقه‌مندی‌ها اضافه شد",
      isFavorite: true,
    };
  },

  // [DB] Get user's post favorites with pagination
  async getMyPostFavorites(userId: string, query: ListFavoritesQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const [items, total] = await Promise.all([
      prisma.blogFavorite.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: postFavoriteInclude,
      }),
      prisma.blogFavorite.count({ where: { userId } }),
    ]);

    return {
      items: items.map(formatPostFavorite),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },
};