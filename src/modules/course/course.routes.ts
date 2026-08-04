import { Router } from "express";
import { uploadCourseImage } from "../../config/multer.js";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { toggleCourseReaction } from "../reaction/reaction.controller.js";
import { toggleReactionSchema } from "../reaction/reaction.validator.js";
import {
  createCourseController,
  deleteCourseController,
  getAdminCoursesController,
  getCourseBySlugController,
  getPublicCoursesController,
  togglePublishController,
  updateCourseController,
} from "./course.controller.js";
import {
  createCourseSchema,
  deleteCourseSchema,
  getCourseBySlugSchema,
  listCoursesAdminSchema,
  listCoursesPublicSchema,
  togglePublishSchema,
  updateCourseSchema,
} from "./course.validator.js";

const router = Router();

// [GET] Admin list courses
router.get(
  "/admin",
  authentication,
  authorize("ADMIN"),
  validate(listCoursesAdminSchema),
  asyncHandler(getAdminCoursesController),
);

// [PATCH] Toggle course publish
router.patch(
  "/:id/publish",
  authentication,
  authorize("ADMIN"),
  validate(togglePublishSchema),
  asyncHandler(togglePublishController),
);

// [POST] Create course with image upload
router.post(
  "/",
  authentication,
  authorize("ADMIN"),
  uploadCourseImage,
  validate(createCourseSchema),
  asyncHandler(createCourseController),
);

// [PUT] Update course with optional image upload
router.put(
  "/:id",
  authentication,
  authorize("ADMIN"),
  uploadCourseImage,
  validate(updateCourseSchema),
  asyncHandler(updateCourseController),
);

// [DELETE] Delete course
router.delete(
  "/:id",
  authentication,
  authorize("ADMIN"),
  validate(deleteCourseSchema),
  asyncHandler(deleteCourseController),
);

// [GET] Public list courses
router.get(
  "/",
  validate(listCoursesPublicSchema),
  asyncHandler(getPublicCoursesController),
);

// [GET] Get course by slug
router.get(
  "/:slug",
  validate(getCourseBySlugSchema),
  asyncHandler(getCourseBySlugController),
);

// [POST] Toggle reaction on course
router.post(
  "/:id/reaction",
  authentication,
  validate(toggleReactionSchema),
  asyncHandler(toggleCourseReaction),
);

export default router;