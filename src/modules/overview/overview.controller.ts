import { RequestHandler } from "express";
import { maskFields } from "../../utils/mask.js";
import { overviewService } from "./overview.service.js";

export const getAdminOverviewController: RequestHandler = async (_req, res) => {
  const overview = await overviewService.getAdminOverview();

  const maskedLatestPending = maskFields(overview.comment.latestPending, [
    "user.email",
  ]);

  return res.status(200).json({
    status: "success",
    data: {
      ...overview,
      comment: {
        ...overview.comment,
        latestPending: maskedLatestPending,
      },
    },
  });
};

export const getAdminUserStatsController: RequestHandler = async (
  _req,
  res,
) => {
  const stats = await overviewService.getAdminUserStats();
  return res.status(200).json({
    status: "success",
    data: { user: stats },
  });
};

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

export const getAdminCommentStatsController: RequestHandler = async (
  _req,
  res,
) => {
  const stats = await overviewService.getAdminCommentStats();

  const maskedLatestPending = maskFields(stats.latestPending, ["user.email"]);

  return res.status(200).json({
    status: "success",
    data: {
      comment: {
        ...stats,
        latestPending: maskedLatestPending,
      },
    },
  });
};

export const getAdminPostStatsController: RequestHandler = async (
  _req,
  res,
) => {
  const stats = await overviewService.getAdminPostStats();
  return res.status(200).json({
    status: "success",
    data: { post: stats },
  });
};

export const getAdminEnrollmentStatsController: RequestHandler = async (
  _req,
  res,
) => {
  const stats = await overviewService.getAdminEnrollmentStats();
  return res.status(200).json({
    status: "success",
    data: { enrollment: stats },
  });
};
