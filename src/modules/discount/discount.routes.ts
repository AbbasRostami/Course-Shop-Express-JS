import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import {
  authorizeAdmins,
  authorizeSuperAdmin,
} from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createDiscountController,
  deleteDiscountController,
  listDiscountsController,
  toggleDiscountController,
} from "./discount.controller.js";
import {
  createDiscountSchema,
  deleteDiscountSchema,
  listDiscountsSchema,
  toggleDiscountSchema,
} from "./discount.validator.js";

const router = Router();

// [MW] All discount routes require auth
router.use(authentication);

// [POST] Create discount code
router.post(
  "/",
  authorizeSuperAdmin(),
  validate(createDiscountSchema),
  asyncHandler(createDiscountController),
);

// [GET] List discount codes
router.get(
  "/",
  authorizeAdmins(),
  validate(listDiscountsSchema),
  asyncHandler(listDiscountsController),
);

// [PATCH] Toggle discount active status
router.patch(
  "/:id/toggle",
  authorizeSuperAdmin(),
  validate(toggleDiscountSchema),
  asyncHandler(toggleDiscountController),
);

// [DELETE] Delete discount code
router.delete(
  "/:id",
  authorizeSuperAdmin(),
  validate(deleteDiscountSchema),
  asyncHandler(deleteDiscountController),
);

export default router;
