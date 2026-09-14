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

// [DB] Base teacher select fields (bilingual)
const teacherSelect = {
  id: true,
  nameFa: true,
  nameEn: true,
  slugFa: true,
  slugEn: true,
  bioFa: true,
  bioEn: true,
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
          nameFa: data.nameFa,
          nameEn: data.nameEn,
          slugFa: createSlug(data.nameFa),
          slugEn: createSlug(data.nameEn),
          bioFa: data.bioFa,
          bioEn: data.bioEn,
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

      // [ERROR] Handle duplicate name/slug
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError("teacher.errors.nameExists", 400, {
          name: "teacher.errors.nameExists",
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
      throw new AppError("teacher.errors.noUpdateData", 400);
    }

    const existing = await prisma.teacher.findUnique({ where: { id } });

    if (!existing) {
      // [CLEANUP] Remove uploaded avatar if teacher not found
      if (data.avatar) {
        await removeCloudinaryImage(data.avatar);
      }
      throw new AppError("teacher.errors.notFound", 404);
    }

    const updateData: Prisma.TeacherUpdateInput = {};

    // [LOGIC] Auto-generate slug on name change
    if (data.nameFa !== undefined) {
      updateData.nameFa = data.nameFa;
      updateData.slugFa = createSlug(data.nameFa);
    }
    if (data.nameEn !== undefined) {
      updateData.nameEn = data.nameEn;
      updateData.slugEn = createSlug(data.nameEn);
    }

    if (data.bioFa !== undefined) updateData.bioFa = data.bioFa;
    if (data.bioEn !== undefined) updateData.bioEn = data.bioEn;

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

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError("teacher.errors.nameExists", 400, {
          name: "teacher.errors.nameExists",
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
      throw new AppError("teacher.errors.notFound", 404);
    }

    // [LOGIC] Block delete if courses are assigned
    if (existing._count.courses > 0) {
      throw new AppError("teacher.errors.hasCourses", 400, undefined, {
        count: existing._count.courses,
      });
    }

    await prisma.teacher.delete({ where: { id } });

    // [CLEANUP] Remove avatar from Cloudinary
    if (existing.avatar) {
      await removeCloudinaryImage(existing.avatar);
    }
  },

  // [DB] Get paginated teachers with bilingual search
  async getTeachers(query: ListTeachersQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.TeacherWhereInput = {};

    if (query.search) {
      where.OR = [
        { nameFa: { contains: query.search, mode: "insensitive" } },
        { nameEn: { contains: query.search, mode: "insensitive" } },
        { bioFa: { contains: query.search, mode: "insensitive" } },
        { bioEn: { contains: query.search, mode: "insensitive" } },
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

  // [DB] Get teacher with published courses by slug (Fa or En)
  async getTeacherBySlug(slug: string) {
    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [{ slugFa: slug }, { slugEn: slug }],
      },
      select: {
        ...teacherSelect,
        courses: {
          where: {
            published: true,
            category: { show: true },
          },
          select: {
            id: true,
            titleFa: true,
            titleEn: true,
            slugFa: true,
            slugEn: true,
            descriptionFa: true,
            descriptionEn: true,
            price: true,
            imageUrl: true,
            level: true,
            createdAt: true,
            category: {
              select: {
                id: true,
                nameFa: true,
                nameEn: true,
                slugFa: true,
                slugEn: true,
              },
            },
            _count: { select: { enrollments: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!teacher) {
      throw new AppError("teacher.errors.notFound", 404);
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
