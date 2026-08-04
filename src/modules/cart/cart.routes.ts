import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  applyDiscountController,
  removeDiscountController,
} from "../discount/discount.controller.js";
import { applyDiscountSchema } from "../discount/discount.validator.js";
import {
  addToCartController,
  clearCartController,
  getCartController,
  removeFromCartController,
} from "./cart.controller.js";
import { addToCartSchema, removeFromCartSchema } from "./cart.validator.js";

const router = Router();

// [MW] All cart routes require auth
router.use(authentication);

// [GET] Get user cart
router.get("/", asyncHandler(getCartController));

// [POST] Add course to cart
router.post(
  "/items",
  validate(addToCartSchema),
  asyncHandler(addToCartController),
);

// [DELETE] Remove course from cart
router.delete(
  "/items/:courseId",
  validate(removeFromCartSchema),
  asyncHandler(removeFromCartController),
);

// [DELETE] Clear entire cart
router.delete("/", asyncHandler(clearCartController));

// [POST] Apply discount code
router.post(
  "/apply-discount",
  validate(applyDiscountSchema),
  asyncHandler(applyDiscountController),
);

// [DELETE] Remove discount code
router.delete("/discount", asyncHandler(removeDiscountController));

export default router;