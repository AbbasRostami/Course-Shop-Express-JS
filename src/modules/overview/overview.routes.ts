import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { authorizeAdmins } from "../../middlewares/authorization.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getAdminCommentStatsController,
  getAdminCourseStatsController,
  getAdminDiscountStatsController,
  getAdminEnrollmentStatsController,
  getAdminOrderStatsController,
  getAdminOverviewController,
  getAdminPostStatsController,
  getAdminRevenueStatsController,
  getAdminUserStatsController,
} from "./overview.controller.js";

const router = Router();

// [GET] Full admin overview
router.get(
  "/admin",
  authentication,
  authorizeAdmins(),
  asyncHandler(getAdminOverviewController),
);

// [GET] User stats
router.get(
  "/admin/users",
  authentication,
  authorizeAdmins(),
  asyncHandler(getAdminUserStatsController),
);

// [GET] Course stats
router.get(
  "/admin/courses",
  authentication,
  authorizeAdmins(),
  asyncHandler(getAdminCourseStatsController),
);

// [GET] Order stats
router.get(
  "/admin/orders",
  authentication,
  authorizeAdmins(),
  asyncHandler(getAdminOrderStatsController),
);

// [GET] Revenue stats
router.get(
  "/admin/revenue",
  authentication,
  authorizeAdmins(),
  asyncHandler(getAdminRevenueStatsController),
);

// [GET] Discount stats
router.get(
  "/admin/discounts",
  authentication,
  authorizeAdmins(),
  asyncHandler(getAdminDiscountStatsController),
);

// [GET] Comment stats
router.get(
  "/admin/comments",
  authentication,
  authorizeAdmins(),
  asyncHandler(getAdminCommentStatsController),
);

// [GET] Post stats
router.get(
  "/admin/posts",
  authentication,
  authorizeAdmins(),
  asyncHandler(getAdminPostStatsController),
);

// [GET] Enrollment stats
router.get(
  "/admin/enrollments",
  authentication,
  authorizeAdmins(),
  asyncHandler(getAdminEnrollmentStatsController),
);

export default router;
