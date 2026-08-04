import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import { createSlug } from "../../utils/slug.js";
import {
  CreateCategoryInput,
  ListCategoriesAdminQuery,
  UpdateCategoryInput,
} from "./category.validator.js";

// [DB] Include total count of courses and posts
const categoryWithCount = {
  _count: {
    select: { courses: true, posts: true },
  },
};

// [DB] Include count of published courses and posts only
const categoryWithPublishedCount = {
  _count: {
    select: {
      courses: { where: { published: true } },
      posts: { where: { published: true } },
    },
  },
};

// [ERROR] Handle duplicate name (P2002)
const handleUniqueError = (error: unknown): never => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError("دسته بندی‌ای با این نام قبلاً ثبت شده است", 400, {
      name: "این نام قبلاً استفاده شده است",
    });
  }
  throw error;
};

export const categoryService = {
  // [DB] Create new category
  async createCategory(data: CreateCategoryInput) {
    try {
      const category = await prisma.category.create({
        data: {
          name: data.name,
          slug: createSlug(data.name),
          description: data.description,
          show: data.show,
        },
      });
      return category;
    } catch (error) {
      handleUniqueError(error);
      throw error;
    }
  },

  // [DB] Get all visible categories for public
  async getPublicCategories() {
    return prisma.category.findMany({
      where: { show: true },
      orderBy: { createdAt: "desc" },
      include: categoryWithPublishedCount,
    });
  },

  // [DB] Get paginated categories for admin
  async getAdminCategories(query: ListCategoriesAdminQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.CategoryWhereInput = {};

    if (query.show !== undefined) {
      where.show = query.show === "true";
    }

    // [LOGIC] Apply search filter
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: categoryWithCount,
      }),
      prisma.category.count({ where }),
    ]);

    return {
      items,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Get single category by slug (public)
  async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findFirst({
      where: { slug, show: true },
      include: categoryWithPublishedCount,
    });

    if (!category) {
      throw new AppError("دسته بندی مورد نظر یافت نشد", 404);
    }

    return category;
  },

  // [DB] Update category name or description
  async updateCategory(id: string, data: UpdateCategoryInput) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("دسته بندی مورد نظر یافت نشد", 404);
    }

    const updateData: Prisma.CategoryUpdateInput = {};

    // [LOGIC] Auto-generate slug on name change
    if (data.name !== undefined) {
      updateData.name = data.name;
      updateData.slug = createSlug(data.name);
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    try {
      return await prisma.category.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      handleUniqueError(error);
      throw error;
    }
  },

  // [DB] Toggle category visibility and cascade to courses/posts
  async toggleVisibility(id: string, show: boolean) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.category.findUnique({ where: { id } });

      if (!existing) {
        throw new AppError("دسته بندی مورد نظر یافت نشد", 404);
      }

      // [LOGIC] Prevent redundant toggle
      if (existing.show === show) {
        throw new AppError(
          show ? "دسته بندی از قبل فعال است" : "دسته بندی از قبل غیرفعال است",
          400,
        );
      }

      const category = await tx.category.update({
        where: { id },
        data: { show },
      });

      // [LOGIC] Unpublish related courses and posts on hide
      if (!show) {
        await tx.course.updateMany({
          where: { categoryId: id, published: true },
          data: { published: false },
        });

        await tx.post.updateMany({
          where: { categoryId: id, published: true },
          data: { published: false },
        });
      }

      return category;
    });
  },

  // [DB] Delete category if no courses or posts exist
  async deleteCategory(id: string) {
    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { courses: true, posts: true },
        },
      },
    });

    if (!existing) {
      throw new AppError("دسته بندی مورد نظر یافت نشد", 404);
    }

    // [LOGIC] Block delete if courses exist
    if (existing._count.courses > 0) {
      throw new AppError(
        `این دسته بندی ${existing._count.courses} دوره دارد. ابتدا دوره‌ها را حذف یا به دسته دیگری منتقل کنید`,
        400,
      );
    }

    // [LOGIC] Block delete if posts exist
    if (existing._count.posts > 0) {
      throw new AppError(
        `این دسته بندی ${existing._count.posts} مقاله دارد. ابتدا مقاله‌ها را حذف یا به دسته دیگری منتقل کنید`,
        400,
      );
    }

    await prisma.category.delete({ where: { id } });
  },
};