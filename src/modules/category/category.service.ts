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

// [ERROR] Handle duplicate name/slug (P2002)
const handleUniqueError = (error: unknown): never => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError("category.errors.nameExists", 400, {
      name: "category.errors.nameExists",
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
          nameFa: data.nameFa,
          nameEn: data.nameEn,
          slugFa: createSlug(data.nameFa),
          slugEn: createSlug(data.nameEn),
          descriptionFa: data.descriptionFa,
          descriptionEn: data.descriptionEn,
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

    // [LOGIC] Apply bilingual search filter
    if (query.search) {
      where.OR = [
        { nameFa: { contains: query.search, mode: "insensitive" } },
        { nameEn: { contains: query.search, mode: "insensitive" } },
        { descriptionFa: { contains: query.search, mode: "insensitive" } },
        { descriptionEn: { contains: query.search, mode: "insensitive" } },
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

  // [DB] Get single category by slug (Fa or En, public)
  async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ slugFa: slug }, { slugEn: slug }],
        show: true,
      },
      include: categoryWithPublishedCount,
    });

    if (!category) {
      throw new AppError("category.errors.notFound", 404);
    }

    return category;
  },

  // [DB] Update category name or description
  async updateCategory(id: string, data: UpdateCategoryInput) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("category.errors.notFound", 404);
    }

    const updateData: Prisma.CategoryUpdateInput = {};

    // [LOGIC] Auto-generate slug on name change
    if (data.nameFa !== undefined) {
      updateData.nameFa = data.nameFa;
      updateData.slugFa = createSlug(data.nameFa);
    }
    if (data.nameEn !== undefined) {
      updateData.nameEn = data.nameEn;
      updateData.slugEn = createSlug(data.nameEn);
    }

    if (data.descriptionFa !== undefined) {
      updateData.descriptionFa = data.descriptionFa;
    }
    if (data.descriptionEn !== undefined) {
      updateData.descriptionEn = data.descriptionEn;
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
        throw new AppError("category.errors.notFound", 404);
      }

      // [LOGIC] Prevent redundant toggle
      if (existing.show === show) {
        throw new AppError(
          show
            ? "category.errors.alreadyActive"
            : "category.errors.alreadyInactive",
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
      throw new AppError("category.errors.notFound", 404);
    }

    // [LOGIC] Block delete if courses exist
    if (existing._count.courses > 0) {
      throw new AppError("category.errors.hasCourses", 400, undefined, {
        count: existing._count.courses,
      });
    }

    // [LOGIC] Block delete if posts exist
    if (existing._count.posts > 0) {
      throw new AppError("category.errors.hasPosts", 400, undefined, {
        count: existing._count.posts,
      });
    }

    await prisma.category.delete({ where: { id } });
  },
};
