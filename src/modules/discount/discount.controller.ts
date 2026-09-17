import { RequestHandler } from "express";
import { discountService } from "./discount.service.js";
import {
  ApplyDiscountInput,
  ListDiscountsQuery,
} from "./discount.validator.js";

// [POST] Create discount code
export const createDiscountController: RequestHandler = async (req, res) => {
  await discountService.createDiscount(req.body);

  return res.status(201).json({
    status: "success",
    data: { message: req.t("discount.success.created") },
  });
};

// [GET] List discount codes
export const listDiscountsController: RequestHandler = async (req, res) => {
  const result = await discountService.listDiscounts(
    req.query as ListDiscountsQuery,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

// [PATCH] Toggle discount status
export const toggleDiscountController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const discount = await discountService.toggleDiscount(id);

  return res.status(200).json({
    status: "success",
    data: {
      message: discount.active
        ? req.t("discount.success.activated")
        : req.t("discount.success.deactivated"),
    },
  });
};

// [DELETE] Delete discount code
export const deleteDiscountController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  await discountService.deleteDiscount(id);

  return res.status(200).json({
    status: "success",
    data: { message: req.t("discount.success.deleted") },
  });
};

// [POST] Apply discount to cart
export const applyDiscountController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const result = await discountService.applyDiscountToCart(
    userId,
    req.body as ApplyDiscountInput,
  );

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t(result.message as any),
      discount: result.discount,
    },
  });
};

// [DELETE] Remove discount from cart
export const removeDiscountController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const result = await discountService.removeDiscountFromCart(userId);

  return res.status(200).json({
    status: "success",
    data: { message: req.t(result.message as any) },
  });
};
