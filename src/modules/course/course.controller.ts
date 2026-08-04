import { RequestHandler } from "express";
import { AppError } from "../../utils/AppError.js";
import { getUserIdFromRequest } from "../../utils/getUserIdFromRequest.js";
import { courseService } from "./course.service.js";
import {
  ListCoursesAdminQuery,
  ListCoursesPublicQuery,
} from "./course.validator.js";

// [POST] Create course
export const createCourseController: RequestHandler = async (req, res) => {
  // [UPLOAD] Extract image URL if uploaded
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
      message: "دوره با موفقیت ایجاد شد",
      course,
    },
  });
};

// [PUT] Update course
export const updateCourseController: RequestHandler = async (req, res, next) => {
  const id = req.params.id as string;
  const updateData: Record<string, unknown> = { ...req.body };

  // [UPLOAD] Attach image URL if uploaded
  if (req.file?.path) {
    updateData.imageUrl = req.file.path;
  }

  if (Object.keys(updateData).length === 0) {
    return next(new AppError("حداقل یک فیلد برای ویرایش ارسال کنید", 400));
  }

  const course = await courseService.updateCourse(id, updateData as any);

  return res.status(200).json({
    status: "success",
    data: {
      message: "دوره با موفقیت ویرایش شد",
      course,
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
      message: published
        ? "دوره با موفقیت منتشر شد"
        : "دوره با موفقیت پنهان شد",
      course,
    },
  });
};

// [DELETE] Delete course
export const deleteCourseController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  await courseService.deleteCourse(id);

  return res.status(200).json({
    status: "success",
    data: { message: "دوره با موفقیت حذف شد" },
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
    data: result,
  });
};

// [GET] Admin list courses
export const getAdminCoursesController: RequestHandler = async (req, res) => {
  const result = await courseService.getAdminCourses(
    req.query as ListCoursesAdminQuery,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

// [GET] Get course by slug
export const getCourseBySlugController: RequestHandler = async (req, res) => {
  const slug = req.params.slug as string;
  const userId = getUserIdFromRequest(req);

  const course = await courseService.getCourseBySlug(slug, userId);

  return res.status(200).json({
    status: "success",
    data: { course },
  });
};