import { RequestHandler } from "express";
import { maskFields, maskItem } from "../../utils/mask.js";
import { orderService } from "./order.service.js";
import { ListAdminOrdersQuery, ListOrdersQuery } from "./order.validator.js";

// [CONFIG] Frontend base URL for redirects
const FRONTEND_URL = process.env.FRONTEND_URL!;

// [POST] Checkout with wallet
export const checkoutWalletController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;

  const result = await orderService.checkoutWithWallet(userId);

  return res.status(200).json({
    status: "success",
    data: {
      message: "پرداخت با موفقیت انجام شد",
      order: result.order,
      newBalance: result.newBalance,
    },
  });
};

// [POST] Checkout with ZarinPal
export const checkoutZarinpalController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;

  const result = await orderService.checkoutWithZarinpal(userId);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

// [GET] Verify ZarinPal callback and redirect
export const verifyOrderController: RequestHandler = async (req, res) => {
  const authority = req.query.Authority as string;
  const status = req.query.Status as string;

  const result = await orderService.verifyZarinpal(authority, status);

  if (result.success) {
    return res.redirect(
      `${FRONTEND_URL}/orders/success?orderId=${result.orderId}&refId=${result.refId}`,
    );
  }

  const reason = encodeURIComponent(result.reason || "پرداخت ناموفق بود");
  return res.redirect(
    `${FRONTEND_URL}/orders/failed?orderId=${result.orderId}&reason=${reason}`,
  );
};

// [GET] Get my orders list
export const getMyOrdersController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;

  const result = await orderService.getMyOrders(
    userId,
    req.query as ListOrdersQuery,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

// [GET] Get single order
export const getOrderController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const orderId = req.params.id as string;

  const order = await orderService.getOrder(orderId, userId);

  return res.status(200).json({
    status: "success",
    data: { order },
  });
};

// [PATCH] Cancel order
export const cancelOrderController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const orderId = req.params.id as string;

  const order = await orderService.cancelOrder(orderId, userId);

  return res.status(200).json({
    status: "success",
    data: {
      message: "سفارش با موفقیت لغو شد",
      order,
    },
  });
};

// [PATCH] Admin cancel order
export const adminCancelOrderController: RequestHandler = async (req, res) => {
  const orderId = req.params.id as string;

  const order = await orderService.adminCancelOrder(orderId);

  return res.status(200).json({
    status: "success",
    data: {
      message: "سفارش توسط ادمین لغو شد",
      order,
    },
  });
};

// [GET] Admin list orders with masked email
export const getAdminOrdersController: RequestHandler = async (req, res) => {
  const result = await orderService.getAdminOrders(
    req.query as ListAdminOrdersQuery,
  );

  // [SECURITY] Mask user email in list
  const maskedItems = maskFields(result.items, ["user.email"]);

  return res.status(200).json({
    status: "success",
    data: {
      ...result,
      items: maskedItems,
    },
  });
};

// [GET] Admin get single order with masked email
export const getAdminOrderController: RequestHandler = async (req, res) => {
  const orderId = req.params.id as string;
  const order = await orderService.getAdminOrder(orderId);

  // [SECURITY] Mask user email in detail
  const maskedOrder = maskItem(order, ["user.email"]);

  return res.status(200).json({
    status: "success",
    data: { order: maskedOrder },
  });
};