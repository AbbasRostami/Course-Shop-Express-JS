import { Router } from "express";
import { uploadPostImage } from "../../config/multer.js";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { togglePostReaction } from "../reaction/reaction.controller.js";
import { toggleReactionSchema } from "../reaction/reaction.validator.js";
import {
  createPostController,
  deletePostController,
  getAdminPostsController,
  getPostBySlugController,
  getPublicPostsController,
  togglePublishPostController,
  updatePostController,
} from "./post.controller.js";
import {
  createPostSchema,
  deletePostSchema,
  getPostBySlugSchema,
  listPostsAdminSchema,
  listPostsPublicSchema,
  togglePublishPostSchema,
  updatePostSchema,
} from "./post.validator.js";

const router = Router();

// [GET] Admin list posts
router.get(
  "/admin",
  authentication,
  authorize("ADMIN"),
  validate(listPostsAdminSchema),
  asyncHandler(getAdminPostsController),
);

// [POST] Create post with image upload
router.post(
  "/",
  authentication,
  authorize("ADMIN"),
  uploadPostImage,
  validate(createPostSchema),
  asyncHandler(createPostController),
);

// [PUT] Update post with optional image upload
router.put(
  "/:id",
  authentication,
  authorize("ADMIN"),
  uploadPostImage,
  validate(updatePostSchema),
  asyncHandler(updatePostController),
);

// [PATCH] Toggle post publish status
router.patch(
  "/:id/publish",
  authentication,
  authorize("ADMIN"),
  validate(togglePublishPostSchema),
  asyncHandler(togglePublishPostController),
);

// [DELETE] Delete post
router.delete(
  "/:id",
  authentication,
  authorize("ADMIN"),
  validate(deletePostSchema),
  asyncHandler(deletePostController),
);

// [GET] Public list posts
router.get(
  "/",
  validate(listPostsPublicSchema),
  asyncHandler(getPublicPostsController),
);

// [GET] Get post by slug
router.get(
  "/:slug",
  validate(getPostBySlugSchema),
  asyncHandler(getPostBySlugController),
);

// [POST] Toggle reaction on post
router.post(
  "/:id/reaction",
  authentication,
  validate(toggleReactionSchema),
  asyncHandler(togglePostReaction),
);

export default router;