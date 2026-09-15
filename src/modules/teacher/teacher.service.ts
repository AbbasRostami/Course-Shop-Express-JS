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
  ListTeachersAdminQuery,
  ListTeachersQuery,
  UpdateTeacherInput,
} from "./teacher.validator.js";

// [DB] Base teacher select fields (bilingual + visibility)
const teacherSelect = {
  id: true,
  nameFa: true,
  nameEn: true,
  slugFa: true,
  slugEn: true,
  bioFa: true,
  bioEn: true,
  avatar: true,
  show: true,
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
          show: data.show,
        },
        select: teacherSelect,
      });

      return teacher;
    } catch (error) {
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
      if (data.avatar) {
        await removeCloudinaryImage(data.avatar);
      }
      throw new AppError("teacher.errors.notFound", 404);
    }

    const updateData: Prisma.TeacherUpdateInput = {};

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

  // [DB] Toggle teacher visibility and cascade unpublish courses
  async toggleVisibility(id: string, show: boolean) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.teacher.findUnique({ where: { id } });

      if (!existing) {
        throw new AppError("teacher.errors.notFound", 404);
      }

      // [LOGIC] Prevent redundant toggle
      if (existing.show === show) {
        throw new AppError(
          show
            ? "teacher.errors.alreadyActive"
            : "teacher.errors.alreadyInactive",
          400,
        );
      }

      const teacher = await tx.teacher.update({
        where: { id },
        data: { show },
        select: teacherSelect,
      });

      // [LOGIC] Unpublish related courses when hiding teacher
      if (!show) {
        await tx.course.updateMany({
          where: { teacherId: id, published: true },
          data: { published: false },
        });
      }

      return teacher;
    });
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

    if (existing._count.courses > 0) {
      throw new AppError("teacher.errors.hasCourses", 400, undefined, {
        count: existing._count.courses,
      });
    }

    await prisma.teacher.delete({ where: { id } });

    if (existing.avatar) {
      await removeCloudinaryImage(existing.avatar);
    }
  },

  // [DB] Get public paginated teachers (show=true only) with bilingual search
  async getTeachers(query: ListTeachersQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.TeacherWhereInput = {
      show: true,
    };

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

    const formattedItems = items.map(({ _count, ...teacher }) => ({
      ...teacher,
      coursesCount: _count.courses,
    }));

    return {
      items: formattedItems,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Admin: Get all teachers (including hidden) with filters
  async getAdminTeachers(query: ListTeachersAdminQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.TeacherWhereInput = {};

    if (query.show !== undefined) {
      where.show = query.show === "true";
    }

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

    const formattedItems = items.map(({ _count, ...teacher }) => ({
      ...teacher,
      coursesCount: _count.courses,
    }));

    return {
      items: formattedItems,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Get teacher with published courses by slug (Fa or En, only if visible)
  async getTeacherBySlug(slug: string) {
    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [{ slugFa: slug }, { slugEn: slug }],
        show: true,
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
      courses: courses.map(({ _count, ...course }) => ({
        ...course,
        studentsCount: _count.enrollments,
      })),
    };
  },
};
