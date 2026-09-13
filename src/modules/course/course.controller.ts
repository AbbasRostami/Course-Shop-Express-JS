import { RequestHandler } from "express";
import { AppError } from "../../utils/AppError.js";
import { getUserIdFromRequest } from "../../utils/getUserIdFromRequest.js";
import { localizePayload } from "../../utils/localize.js";
import { courseService } from "./course.service.js";
import {
  ListCoursesAdminQuery,
  ListCoursesPublicQuery,
} from "./course.validator.js";

// [POST] Create course
export const createCourseController: RequestHandler = async (req, res) => {
  let imageUrl: string | undefined = undefined;
  if (req.file) {
    imageUrl = req.file.path;
  }

  const course = await courseService.createCourse({
    ...req.body,
    imageUrl,
  });

  return res.status(201).json({
    status: "success",
    data: {
      message: req.t("course.success.created"),
      course: localizePayload(course, req.locale),
    },
  });
};

// [PUT] Update course
export const updateCourseController: RequestHandler = async (
  req,
  res,
  next,
) => {
  const id = req.params.id as string;
  const updateData: Record<string, unknown> = { ...req.body };

  if (req.file?.path) {
    updateData.imageUrl = req.file.path;
  }

  if (Object.keys(updateData).length === 0) {
    return next(new AppError("course.errors.noUpdateData", 400));
  }

  const course = await courseService.updateCourse(id, updateData as any);

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t("course.success.updated"),
      course: localizePayload(course, req.locale),
    },
  });
};

// [PATCH] Toggle publish status
export const togglePublishController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const { published } = req.body;

  const course = await courseService.togglePublish(id, published);

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t(
        published ? "course.success.published" : "course.success.hidden",
      ),
      course: localizePayload(course, req.locale),
    },
  });
};

// [DELETE] Delete course
export const deleteCourseController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  await courseService.deleteCourse(id);

  return res.status(200).json({
    status: "success",
    data: { message: req.t("course.success.deleted") },
  });
};

// [GET] Public list courses
export const getPublicCoursesController: RequestHandler = async (req, res) => {
  const userId = getUserIdFromRequest(req);

  const result = await courseService.getPublicCourses(
    req.query as ListCoursesPublicQuery,
    userId,
  );

  return res.status(200).json({
    status: "success",
    data: {
      items: localizePayload(result.items, req.locale),
      pagination: result.pagination,
    },
  });
};

// [GET] Admin list courses
export const getAdminCoursesController: RequestHandler = async (req, res) => {
  const result = await courseService.getAdminCourses(
    req.query as ListCoursesAdminQuery,
  );

  return res.status(200).json({
    status: "success",
    data: {
      items: localizePayload(result.items, req.locale),
      pagination: result.pagination,
    },
  });
};

// [GET] Get course by slug (works with Fa or En slug)
export const getCourseBySlugController: RequestHandler = async (req, res) => {
  const slug = req.params.slug as string;
  const userId = getUserIdFromRequest(req);

  const course = await courseService.getCourseBySlug(slug, userId);

  return res.status(200).json({
    status: "success",
    data: {
      course: localizePayload(course, req.locale),
    },
  });
};
