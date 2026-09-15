import { Router } from "express";
import { uploadTeacherAvatar } from "../../config/multer.js";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createTeacherController,
  deleteTeacherController,
  getAdminTeachersController,
  getTeacherBySlugController,
  getTeachersController,
  toggleTeacherVisibilityController,
  updateTeacherController,
} from "./teacher.controller.js";
import {
  createTeacherSchema,
  deleteTeacherSchema,
  getTeacherBySlugSchema,
  listTeachersAdminSchema,
  listTeachersSchema,
  toggleTeacherVisibilitySchema,
  updateTeacherSchema,
} from "./teacher.validator.js";

const router = Router();

// [GET] Admin list teachers with filters
router.get(
  "/admin",
  authentication,
  authorize("ADMIN"),
  validate(listTeachersAdminSchema),
  asyncHandler(getAdminTeachersController),
);

// [PATCH] Toggle teacher visibility
router.patch(
  "/:id/visibility",
  authentication,
  authorize("ADMIN"),
  validate(toggleTeacherVisibilitySchema),
  asyncHandler(toggleTeacherVisibilityController),
);

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

// [GET] Public list teachers (only show=true)
router.get(
  "/",
  validate(listTeachersSchema),
  asyncHandler(getTeachersController),
);

// [GET] Get teacher by slug (only visible teachers)
router.get(
  "/:slug",
  validate(getTeacherBySlugSchema),
  asyncHandler(getTeacherBySlugController),
);

export default router;
