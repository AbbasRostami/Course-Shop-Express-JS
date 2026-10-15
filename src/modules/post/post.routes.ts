import { Router } from "express";
import { uploadPostImage } from "../../config/multer.js";
import { authentication } from "../../middlewares/authentication.js";
import {
  authorizeAdmins,
  authorizeSuperAdmin,
} from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { togglePostReaction } from "../reaction/reaction.controller.js";
import { toggleReactionSchema } from "../reaction/reaction.validator.js";
import {
  createPostController,
  deletePostController,
  getAdminPostByIdOrSlugController,
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
  authorizeAdmins(),
  validate(listPostsAdminSchema),
  asyncHandler(getAdminPostsController),
);

// [POST] Create post with image upload
router.post(
  "/",
  authentication,
  authorizeSuperAdmin(),
  uploadPostImage,
  validate(createPostSchema),
  asyncHandler(createPostController),
);

// [PUT] Update post with optional image upload
router.put(
  "/:id",
  authentication,
  authorizeSuperAdmin(),
  uploadPostImage,
  validate(updatePostSchema),
  asyncHandler(updatePostController),
);

// [GET] Admin get single post by ID or Slug
router.get(
  "/admin/:idOrSlug",
  authentication,
  authorizeAdmins(),
  asyncHandler(getAdminPostByIdOrSlugController),
);

// [PATCH] Toggle post publish status
router.patch(
  "/:id/publish",
  authentication,
  authorizeSuperAdmin(),
  validate(togglePublishPostSchema),
  asyncHandler(togglePublishPostController),
);

// [DELETE] Delete post
router.delete(
  "/:id",
  authentication,
  authorizeSuperAdmin(),
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
