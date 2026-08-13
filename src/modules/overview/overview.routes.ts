import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
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
router.get("/admin", authentication, authorize("ADMIN"), asyncHandler(getAdminOverviewController));

// [GET] User stats
router.get("/admin/users", authentication, authorize("ADMIN"), asyncHandler(getAdminUserStatsController));

// [GET] Course stats
router.get("/admin/courses", authentication, authorize("ADMIN"), asyncHandler(getAdminCourseStatsController));

// [GET] Order stats
router.get("/admin/orders", authentication, authorize("ADMIN"), asyncHandler(getAdminOrderStatsController));

// [GET] Revenue stats
router.get("/admin/revenue", authentication, authorize("ADMIN"), asyncHandler(getAdminRevenueStatsController));

// [GET] Discount stats
router.get("/admin/discounts", authentication, authorize("ADMIN"), asyncHandler(getAdminDiscountStatsController));

// [GET] Comment stats
router.get("/admin/comments", authentication, authorize("ADMIN"), asyncHandler(getAdminCommentStatsController));

// [GET] Post stats
router.get("/admin/posts", authentication, authorize("ADMIN"), asyncHandler(getAdminPostStatsController));

// [GET] Enrollment stats
router.get("/admin/enrollments", authentication, authorize("ADMIN"), asyncHandler(getAdminEnrollmentStatsController));

export default router;