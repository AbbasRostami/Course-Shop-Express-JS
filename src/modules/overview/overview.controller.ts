import { RequestHandler } from "express";
import { localizePayload } from "../../utils/localize.js";
import { maskFields } from "../../utils/mask.js";
import { overviewService } from "./overview.service.js";

// [GET] Full admin overview with masked emails and localized content
export const getAdminOverviewController: RequestHandler = async (req, res) => {
  const overview = await overviewService.getAdminOverview();

  // [SECURITY] Mask user email in pending comments
  const maskedLatestPending = maskFields(overview.comment.latestPending, [
    "user.email",
  ]);

  const localizedOverview = {
    ...overview,
    comment: {
      ...overview.comment,
      latestPending: localizePayload(maskedLatestPending, req.locale),
    },
    enrollment: {
      ...overview.enrollment,
      topCourses: localizePayload(overview.enrollment.topCourses, req.locale),
    },
  };

  return res.status(200).json({
    status: "success",
    data: localizedOverview,
  });
};

// [GET] User stats
export const getAdminUserStatsController: RequestHandler = async (_req, res) => {
  const stats = await overviewService.getAdminUserStats();
  return res.status(200).json({
    status: "success",
    data: { user: stats },
  });
};

// [GET] Course stats
export const getAdminCourseStatsController: RequestHandler = async (
  _req,
  res,
) => {
  const stats = await overviewService.getAdminCourseStats();
  return res.status(200).json({
    status: "success",
    data: { course: stats },
  });
};

// [GET] Order stats
export const getAdminOrderStatsController: RequestHandler = async (
  _req,
  res,
) => {
  const stats = await overviewService.getAdminOrderStats();
  return res.status(200).json({
    status: "success",
    data: { order: stats },
  });
};

// [GET] Revenue stats
export const getAdminRevenueStatsController: RequestHandler = async (
  _req,
  res,
) => {
  const stats = await overviewService.getAdminRevenueStats();
  return res.status(200).json({
    status: "success",
    data: { revenue: stats },
  });
};

// [GET] Discount stats
export const getAdminDiscountStatsController: RequestHandler = async (
  _req,
  res,
) => {
  const stats = await overviewService.getAdminDiscountStats();
  return res.status(200).json({
    status: "success",
    data: { discount: stats },
  });
};

// [GET] Comment stats with masked emails and localized content
export const getAdminCommentStatsController: RequestHandler = async (
  req,
  res,
) => {
  const stats = await overviewService.getAdminCommentStats();

  // [SECURITY] Mask user email in pending comments
  const maskedLatestPending = maskFields(stats.latestPending, ["user.email"]);

  return res.status(200).json({
    status: "success",
    data: {
      comment: {
        ...stats,
        latestPending: localizePayload(maskedLatestPending, req.locale),
      },
    },
  });
};

// [GET] Post stats
export const getAdminPostStatsController: RequestHandler = async (_req, res) => {
  const stats = await overviewService.getAdminPostStats();
  return res.status(200).json({
    status: "success",
    data: { post: stats },
  });
};

// [GET] Enrollment stats with localized top courses
export const getAdminEnrollmentStatsController: RequestHandler = async (
  req,
  res,
) => {
  const stats = await overviewService.getAdminEnrollmentStats();

  return res.status(200).json({
    status: "success",
    data: {
      enrollment: {
        ...stats,
        topCourses: localizePayload(stats.topCourses, req.locale),
      },
    },
  });
};