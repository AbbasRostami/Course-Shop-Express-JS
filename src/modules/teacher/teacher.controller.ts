import { RequestHandler } from "express";
import { AppError } from "../../utils/AppError.js";
import { localizePayload } from "../../utils/localize.js";
import { teacherService } from "./teacher.service.js";
import {
  ListTeachersAdminQuery,
  ListTeachersQuery,
} from "./teacher.validator.js";

// [POST] Create teacher
export const createTeacherController: RequestHandler = async (req, res) => {
  let avatar: string | undefined;
  if (req.file) {
    avatar = req.file.path;
  }

  const teacher = await teacherService.createTeacher({ ...req.body, avatar });

  return res.status(201).json({
    status: "success",
    data: {
      message: req.t("teacher.success.created"),
      teacher: localizePayload(teacher, req.locale),
    },
  });
};

// [PUT] Update teacher
export const updateTeacherController: RequestHandler = async (
  req,
  res,
  next,
) => {
  const id = req.params.id as string;

  const updateData: {
    nameFa?: string;
    nameEn?: string;
    bioFa?: string | null;
    bioEn?: string | null;
    avatar?: string;
  } = {};

  if (req.body.nameFa !== undefined) updateData.nameFa = req.body.nameFa;
  if (req.body.nameEn !== undefined) updateData.nameEn = req.body.nameEn;
  if (req.body.bioFa !== undefined) updateData.bioFa = req.body.bioFa;
  if (req.body.bioEn !== undefined) updateData.bioEn = req.body.bioEn;

  if (req.file?.path) {
    updateData.avatar = req.file.path;
  }

  if (Object.keys(updateData).length === 0) {
    return next(new AppError("teacher.errors.noUpdateData", 400));
  }

  const teacher = await teacherService.updateTeacher(id, updateData);

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t("teacher.success.updated"),
      teacher: localizePayload(teacher, req.locale),
    },
  });
};

// [PATCH] Toggle teacher visibility
export const toggleTeacherVisibilityController: RequestHandler = async (
  req,
  res,
) => {
  const id = req.params.id as string;
  const { show } = req.body;

  await teacherService.toggleVisibility(id, show);

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t(
        show ? "teacher.success.activated" : "teacher.success.deactivated",
      ),
    },
  });
};

// [DELETE] Delete teacher
export const deleteTeacherController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  await teacherService.deleteTeacher(id);

  return res.status(200).json({
    status: "success",
    data: { message: req.t("teacher.success.deleted") },
  });
};

// [GET] Public list teachers
export const getTeachersController: RequestHandler = async (req, res) => {
  const result = await teacherService.getTeachers(
    req.query as ListTeachersQuery,
  );

  return res.status(200).json({
    status: "success",
    data: {
      items: localizePayload(result.items, req.locale),
      pagination: result.pagination,
    },
  });
};

// [GET] Admin list teachers (including hidden)
export const getAdminTeachersController: RequestHandler = async (req, res) => {
  const result = await teacherService.getAdminTeachers(
    req.query as ListTeachersAdminQuery,
  );

  return res.status(200).json({
    status: "success",
    data: {
      items: localizePayload(result.items, req.locale),
      pagination: result.pagination,
    },
  });
};

// [GET] Get teacher by slug (only visible teachers)
export const getTeacherBySlugController: RequestHandler = async (req, res) => {
  const slug = req.params.slug as string;
  const teacher = await teacherService.getTeacherBySlug(slug);

  return res.status(200).json({
    status: "success",
    data: {
      teacher: localizePayload(teacher, req.locale),
    },
  });
};