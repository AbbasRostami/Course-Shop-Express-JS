import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createCategoryController,
  deleteCategoryController,
  getAdminCategoriesController,
  getCategoryBySlugController,
  getPublicCategoriesController,
  toggleVisibilityController,
  updateCategoryController,
} from "./category.controller.js";
import {
  createCategorySchema,
  deleteCategorySchema,
  getCategoryBySlugSchema,
  listCategoriesAdminSchema,
  toggleVisibilitySchema,
  updateCategorySchema,
} from "./category.validator.js";

const router = Router();

// [GET] Admin list categories
router.get(
  "/admin",
  authentication,
  authorize("ADMIN"),
  validate(listCategoriesAdminSchema),
  asyncHandler(getAdminCategoriesController),
);

// [PATCH] Toggle category visibility
router.patch(
  "/:id/visibility",
  authentication,
  authorize("ADMIN"),
  validate(toggleVisibilitySchema),
  asyncHandler(toggleVisibilityController),
);

// [POST] Create category
router.post(
  "/",
  authentication,
  authorize("ADMIN"),
  validate(createCategorySchema),
  asyncHandler(createCategoryController),
);

// [PUT] Update category
router.put(
  "/:id",
  authentication,
  authorize("ADMIN"),
  validate(updateCategorySchema),
  asyncHandler(updateCategoryController),
);

// [DELETE] Delete category
router.delete(
  "/:id",
  authentication,
  authorize("ADMIN"),
  validate(deleteCategorySchema),
  asyncHandler(deleteCategoryController),
);

// [GET] Public list categories
router.get("/", asyncHandler(getPublicCategoriesController));

// [GET] Public get category by slug
router.get(
  "/:slug",
  validate(getCategoryBySlugSchema),
  asyncHandler(getCategoryBySlugController),
);

export default router;