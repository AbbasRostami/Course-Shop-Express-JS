import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getMyCourseFavoritesController,
  getMyPostFavoritesController,
  toggleCourseFavoriteController,
  togglePostFavoriteController,
} from "./favorite.controller.js";
import {
  listFavoritesSchema,
  toggleCourseFavoriteSchema,
  togglePostFavoriteSchema,
} from "./favorite.validator.js";

const router = Router();

// [MW] All favorite routes require auth
router.use(authentication);

// [POST] Toggle course favorite
router.post(
  "/courses/:courseId",
  validate(toggleCourseFavoriteSchema),
  asyncHandler(toggleCourseFavoriteController),
);

// [GET] Get my course favorites
router.get(
  "/courses",
  validate(listFavoritesSchema),
  asyncHandler(getMyCourseFavoritesController),
);

// [POST] Toggle post favorite
router.post(
  "/posts/:postId",
  validate(togglePostFavoriteSchema),
  asyncHandler(togglePostFavoriteController),
);

// [GET] Get my post favorites
router.get(
  "/posts",
  validate(listFavoritesSchema),
  asyncHandler(getMyPostFavoritesController),
);

export default router;