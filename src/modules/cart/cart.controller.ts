import { RequestHandler } from "express";
import { cartService } from "./cart.service.js";
import { AddToCartInput } from "./cart.validator.js";

// [POST] Add course to cart
export const addToCartController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const { courseId } = req.body as AddToCartInput;

  const result = await cartService.addItem(userId, courseId);

  return res.status(201).json({
    status: "success",
    data: result,
  });
};

// [GET] Get user cart
export const getCartController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const cart = await cartService.getCart(userId);

  return res.status(200).json({
    status: "success",
    data: { cart },
  });
};

// [DELETE] Remove course from cart
export const removeFromCartController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const courseId = req.params.courseId as string;

  const result = await cartService.removeItem(userId, courseId);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

// [DELETE] Clear entire cart
export const clearCartController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const result = await cartService.clearCart(userId);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};