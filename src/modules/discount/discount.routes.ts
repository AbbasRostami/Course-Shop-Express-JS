import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
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

// [MW] All discount routes require admin auth
router.use(authentication, authorize("ADMIN"));

// [POST] Create discount code
router.post(
  "/",
  validate(createDiscountSchema),
  asyncHandler(createDiscountController),
);

// [GET] List discount codes
router.get(
  "/",
  validate(listDiscountsSchema),
  asyncHandler(listDiscountsController),
);

// [PATCH] Toggle discount active status
router.patch(
  "/:id/toggle",
  validate(toggleDiscountSchema),
  asyncHandler(toggleDiscountController),
);

// [DELETE] Delete discount code
router.delete(
  "/:id",
  validate(deleteDiscountSchema),
  asyncHandler(deleteDiscountController),
);

export default router;