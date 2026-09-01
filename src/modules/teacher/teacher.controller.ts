import { RequestHandler } from "express";
import { AppError } from "../../utils/AppError.js";
import { teacherService } from "./teacher.service.js";
import { ListTeachersQuery } from "./teacher.validator.js";

// [POST] Create teacher
export const createTeacherController: RequestHandler = async (req, res) => {
  // [UPLOAD] Extract avatar URL if uploaded
  let avatar: string | undefined;
  if (req.file) {
    avatar = req.file.path;
  }

  await teacherService.createTeacher({ ...req.body, avatar });

  return res.status(201).json({
    status: "success",
    data: { message: "مدرس با موفقیت ایجاد شد" },
  });
};

// [PUT] Update teacher
export const updateTeacherController: RequestHandler = async (req, res, next) => {
  const id = req.params.id as string;

  const updateData: {
    name?: string;
    bio?: string | null;
    avatar?: string;
  } = {};

  if (req.body.name !== undefined) updateData.name = req.body.name;
  if (req.body.bio !== undefined) updateData.bio = req.body.bio;

  // [UPLOAD] Attach avatar URL if uploaded
  if (req.file?.path) {
    updateData.avatar = req.file.path;
  }

  if (Object.keys(updateData).length === 0) {
    return next(new AppError("حداقل یک فیلد برای ویرایش ارسال کنید", 400));
  }

  await teacherService.updateTeacher(id, updateData);

  return res.status(200).json({
    status: "success",
    data: { message: "مدرس با موفقیت ویرایش شد" },
  });
};

// [DELETE] Delete teacher
export const deleteTeacherController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  await teacherService.deleteTeacher(id);

  return res.status(200).json({
    status: "success",
    data: { message: "مدرس با موفقیت حذف شد" },
  });
};

// [GET] List teachers with pagination
export const getTeachersController: RequestHandler = async (req, res) => {
  const result = await teacherService.getTeachers(req.query as ListTeachersQuery);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

// [GET] Get teacher by slug
export const getTeacherBySlugController: RequestHandler = async (req, res) => {
  const slug = req.params.slug as string;
  const teacher = await teacherService.getTeacherBySlug(slug);

  return res.status(200).json({
    status: "success",
    data: { teacher },
  });
};