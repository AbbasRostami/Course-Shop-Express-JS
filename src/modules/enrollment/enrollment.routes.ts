import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  enrollController,
  getMyEnrollmentsController,
} from "./enrollment.controller.js";
import { enrollSchema, listMyCoursesSchema } from "./enrollment.validator.js";

const router = Router();

// [GET] Get my enrolled courses
router.get(
  "/my-courses",
  authentication,
  validate(listMyCoursesSchema),
  asyncHandler(getMyEnrollmentsController),
);

// [POST] Enroll in free course by slug
router.post(
  "/:slug",
  authentication,
  validate(enrollSchema),
  asyncHandler(enrollController),
);

export default router;