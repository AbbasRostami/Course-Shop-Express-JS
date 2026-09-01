import { Router } from "express";
import { uploadTeacherAvatar } from "../../config/multer.js";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createTeacherController,
  deleteTeacherController,
  getTeacherBySlugController,
  getTeachersController,
  updateTeacherController,
} from "./teacher.controller.js";
import {
  createTeacherSchema,
  deleteTeacherSchema,
  getTeacherBySlugSchema,
  listTeachersSchema,
  updateTeacherSchema,
} from "./teacher.validator.js";

const router = Router();

// [POST] Create teacher with avatar upload
router.post(
  "/",
  authentication,
  authorize("ADMIN"),
  uploadTeacherAvatar,
  validate(createTeacherSchema),
  asyncHandler(createTeacherController),
);

// [PUT] Update teacher with optional avatar upload
router.put(
  "/:id",
  authentication,
  authorize("ADMIN"),
  uploadTeacherAvatar,
  validate(updateTeacherSchema),
  asyncHandler(updateTeacherController),
);

// [DELETE] Delete teacher
router.delete(
  "/:id",
  authentication,
  authorize("ADMIN"),
  validate(deleteTeacherSchema),
  asyncHandler(deleteTeacherController),
);

// [GET] Public list teachers
router.get(
  "/",
  validate(listTeachersSchema),
  asyncHandler(getTeachersController),
);

// [GET] Get teacher by slug
router.get(
  "/:slug",
  validate(getTeacherBySlugSchema),
  asyncHandler(getTeacherBySlugController),
);

export default router;