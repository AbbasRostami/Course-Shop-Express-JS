import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import {
  authorizeAdmins,
  authorizeSuperAdmin,
} from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createCategoryController,
  deleteCategoryController,
  getAdminCategoriesController,
  getAdminCategoryByIdController,
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
  authorizeAdmins(),
  validate(listCategoriesAdminSchema),
  asyncHandler(getAdminCategoriesController),
);

// [GET] Admin get single category by ID
router.get(
  "/admin/:id",
  authentication,
  authorizeAdmins(),
  asyncHandler(getAdminCategoryByIdController),
);

// [PATCH] Toggle category visibility
router.patch(
  "/:id/visibility",
  authentication,
  authorizeSuperAdmin(),
  validate(toggleVisibilitySchema),
  asyncHandler(toggleVisibilityController),
);

// [POST] Create category
router.post(
  "/",
  authentication,
  authorizeSuperAdmin(),
  validate(createCategorySchema),
  asyncHandler(createCategoryController),
);

// [PUT] Update category
router.put(
  "/:id",
  authentication,
  authorizeSuperAdmin(),
  validate(updateCategorySchema),
  asyncHandler(updateCategoryController),
);

// [DELETE] Delete category
router.delete(
  "/:id",
  authentication,
  authorizeSuperAdmin(),
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
