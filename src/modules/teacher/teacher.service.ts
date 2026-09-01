import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { removeCloudinaryImage } from "../../utils/cloudinary.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import { createSlug } from "../../utils/slug.js";
import {
  CreateTeacherInput,
  ListTeachersQuery,
  UpdateTeacherInput,
} from "./teacher.validator.js";

// [DB] Base teacher select fields
const teacherSelect = {
  id: true,
  name: true,
  slug: true,
  bio: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TeacherSelect;

export const teacherService = {
  // [DB] Create new teacher
  async createTeacher(data: CreateTeacherInput & { avatar?: string }) {
    try {
      const teacher = await prisma.teacher.create({
        data: {
          name: data.name,
          slug: createSlug(data.name),
          bio: data.bio,
          avatar: data.avatar,
        },
        select: teacherSelect,
      });

      return teacher;
    } catch (error) {
      // [CLEANUP] Remove uploaded avatar on failure
      if (data.avatar) {
        await removeCloudinaryImage(data.avatar);
      }

      // [ERROR] Handle duplicate name
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError("مدرسی با این نام قبلاً ثبت شده است", 400, {
          name: "این نام قبلاً استفاده شده است",
        });
      }

      throw error;
    }
  },

  // [DB] Update existing teacher
  async updateTeacher(
    id: string,
    data: UpdateTeacherInput & { avatar?: string },
  ) {
    if (Object.keys(data).length === 0) {
      throw new AppError("حداقل یک فیلد برای ویرایش ارسال کنید", 400);
    }

    const existing = await prisma.teacher.findUnique({ where: { id } });

    if (!existing) {
      // [CLEANUP] Remove uploaded avatar if teacher not found
      if (data.avatar) {
        await removeCloudinaryImage(data.avatar);
      }
      throw new AppError("مدرس مورد نظر یافت نشد", 404);
    }

    const updateData: Prisma.TeacherUpdateInput = {};

    // [LOGIC] Auto-generate slug on name change
    if (data.name !== undefined) {
      updateData.name = data.name;
      updateData.slug = createSlug(data.name);
    }

    if (data.bio !== undefined) updateData.bio = data.bio;

    if (data.avatar) {
      // [CLEANUP] Remove old avatar before setting new one
      if (existing.avatar) {
        await removeCloudinaryImage(existing.avatar);
      }
      updateData.avatar = data.avatar;
    }

    try {
      const teacher = await prisma.teacher.update({
        where: { id },
        data: updateData,
        select: teacherSelect,
      });

      return teacher;
    } catch (error) {
      // [CLEANUP] Remove uploaded avatar on failure
      if (data.avatar) {
        await removeCloudinaryImage(data.avatar);
      }

      // [ERROR] Handle duplicate name
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError("مدرسی با این نام قبلاً ثبت شده است", 400, {
          name: "این نام قبلاً استفاده شده است",
        });
      }

      throw error;
    }
  },

  // [DB] Delete teacher if no courses assigned
  async deleteTeacher(id: string) {
    const existing = await prisma.teacher.findUnique({
      where: { id },
      include: { _count: { select: { courses: true } } },
    });

    if (!existing) {
      throw new AppError("مدرس مورد نظر یافت نشد", 404);
    }

    // [LOGIC] Block delete if courses are assigned
    if (existing._count.courses > 0) {
      throw new AppError(
        `این مدرس ${existing._count.courses} دوره دارد. ابتدا دوره‌ها را حذف یا به مدرس دیگری منتقل کنید`,
        400,
      );
    }

    await prisma.teacher.delete({ where: { id } });

    // [CLEANUP] Remove avatar from Cloudinary
    if (existing.avatar) {
      await removeCloudinaryImage(existing.avatar);
    }
  },

  // [DB] Get paginated teachers with search
  async getTeachers(query: ListTeachersQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.TeacherWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { bio: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          ...teacherSelect,
          _count: { select: { courses: true } },
        },
      }),
      prisma.teacher.count({ where }),
    ]);

    // [UTIL] Flatten _count into coursesCount
    const formattedItems = items.map(({ _count, ...teacher }) => ({
      ...teacher,
      coursesCount: _count.courses,
    }));

    return {
      items: formattedItems,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Get teacher with published courses by slug
  async getTeacherBySlug(slug: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { slug },
      select: {
        ...teacherSelect,
        courses: {
          where: {
            published: true,
            category: { show: true },
          },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            price: true,
            imageUrl: true,
            level: true,
            createdAt: true,
            category: {
              select: { id: true, name: true, slug: true },
            },
            _count: { select: { enrollments: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!teacher) {
      throw new AppError("مدرس مورد نظر یافت نشد", 404);
    }

    const { courses, ...rest } = teacher;

    return {
      ...rest,
      // [UTIL] Flatten _count into studentsCount
      courses: courses.map(({ _count, ...course }) => ({
        ...course,
        studentsCount: _count.enrollments,
      })),
    };
  },
};