import { RequestHandler } from "express";
import { localizePayload } from "../../utils/localize.js";
import { enrollmentService } from "./enrollment.service.js";
import { ListMyCoursesQuery } from "./enrollment.validator.js";

// [POST] Enroll in course
export const enrollController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const slug = req.params.slug as string;

  const result = await enrollmentService.enroll(userId, slug);

  return res.status(201).json({
    status: "success",
    data: {
      message: req.t(result.message as any),
      enrollment: localizePayload(result.enrollment, req.locale),
    },
  });
};

// [GET] Get my enrolled courses
export const getMyEnrollmentsController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;

  const result = await enrollmentService.getMyEnrollments(
    userId,
    req.query as ListMyCoursesQuery,
  );

  return res.status(200).json({
    status: "success",
    data: {
      items: localizePayload(result.items, req.locale),
      pagination: result.pagination,
    },
  });
};
