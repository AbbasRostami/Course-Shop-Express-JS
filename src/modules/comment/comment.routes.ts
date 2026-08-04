import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { toggleCommentReaction } from "../reaction/reaction.controller.js";
import { toggleReactionSchema } from "../reaction/reaction.validator.js";
import {
  approveCommentController,
  createCommentController,
  deleteCommentController,
  getAdminCommentsController,
  getCourseCommentsController,
  getMyCommentsController,
  getPostCommentsController,
  rejectCommentController,
} from "./comment.controller.js";
import {
  createCommentSchema,
  deleteCommentSchema,
  listAdminCommentsSchema,
  listCourseCommentsSchema,
  listMyCommentsSchema,
  listPostCommentsSchema,
  moderateCommentSchema,
} from "./comment.validator.js";

const router = Router();

// [GET] Course comments (public)
router.get(
  "/course/:slug",
  validate(listCourseCommentsSchema),
  asyncHandler(getCourseCommentsController),
);

// [GET] Post comments (public)
router.get(
  "/post/:slug",
  validate(listPostCommentsSchema),
  asyncHandler(getPostCommentsController),
);

// [POST] Create comment
router.post(
  "/",
  authentication,
  validate(createCommentSchema),
  asyncHandler(createCommentController),
);

// [GET] My comments
router.get(
  "/my-comments",
  authentication,
  validate(listMyCommentsSchema),
  asyncHandler(getMyCommentsController),
);

// [GET] Admin all comments
router.get(
  "/admin",
  authentication,
  authorize("ADMIN"),
  validate(listAdminCommentsSchema),
  asyncHandler(getAdminCommentsController),
);

// [DELETE] Delete comment
router.delete(
  "/:id",
  authentication,
  validate(deleteCommentSchema),
  asyncHandler(deleteCommentController),
);

// [POST] Toggle reaction on comment
router.post(
  "/:id/reaction",
  authentication,
  validate(toggleReactionSchema),
  asyncHandler(toggleCommentReaction),
);

// [PATCH] Approve comment (admin)
router.patch(
  "/:id/approve",
  authentication,
  authorize("ADMIN"),
  validate(moderateCommentSchema),
  asyncHandler(approveCommentController),
);

// [PATCH] Reject comment (admin)
router.patch(
  "/:id/reject",
  authentication,
  authorize("ADMIN"),
  validate(moderateCommentSchema),
  asyncHandler(rejectCommentController),
);

export default router;