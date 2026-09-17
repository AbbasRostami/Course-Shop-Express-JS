import { RequestHandler } from "express";
import { localizePayload } from "../../utils/localize.js";
import { cartService } from "./cart.service.js";
import { AddToCartInput, SyncCartInput } from "./cart.validator.js";

// [POST] Add course to cart
export const addToCartController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const { courseId } = req.body as AddToCartInput;

  const result = await cartService.addItem(userId, courseId);

  return res.status(201).json({
    status: "success",
    data: {
      message: req.t(result.message as any),
    },
  });
};

// [POST] Sync guest cart with user cart after login
export const syncCartController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const body = req.body as SyncCartInput;

  await cartService.syncCart(userId, body);

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t("cart.success.synced"),
    },
  });
};

// [GET] Get user cart
export const getCartController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const cart = await cartService.getCart(userId);

  return res.status(200).json({
    status: "success",
    data: {
      cart: localizePayload(cart, req.locale),
    },
  });
};

// [DELETE] Remove course from cart
export const removeFromCartController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const courseId = req.params.courseId as string;

  const result = await cartService.removeItem(userId, courseId);

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t(result.message as any),
    },
  });
};

// [DELETE] Clear entire cart
export const clearCartController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const result = await cartService.clearCart(userId);

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t(result.message as any),
    },
  });
};
