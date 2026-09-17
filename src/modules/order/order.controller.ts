import { RequestHandler } from "express";
import { localizePayload } from "../../utils/localize.js";
import { maskFields, maskItem } from "../../utils/mask.js";
import { orderService } from "./order.service.js";
import { ListAdminOrdersQuery, ListOrdersQuery } from "./order.validator.js";

// [CONFIG] Frontend base URL for redirects
const FRONTEND_URL = process.env.FRONTEND_URL!;

// [POST] Checkout with wallet
export const checkoutWalletController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;

  const result = await orderService.checkoutWithWallet(userId, req.locale);

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t("order.success.paid"),
      order: localizePayload(result.order, req.locale),
      newBalance: result.newBalance,
    },
  });
};

// [POST] Checkout with ZarinPal
export const checkoutZarinpalController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;

  const result = await orderService.checkoutWithZarinpal(userId, req.locale);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

// [GET] Verify ZarinPal callback and redirect (translates failure reasons)
export const verifyOrderController: RequestHandler = async (req, res) => {
  const authority = req.query.Authority as string;
  const status = req.query.Status as string;

  const result = await orderService.verifyZarinpal(authority, status);

  if (result.success) {
    return res.redirect(
      `${FRONTEND_URL}/orders/success?orderId=${result.orderId}&refId=${result.refId}`,
    );
  }

  const localizedReason = req.t(
    (result.reason || "order.errors.paymentFailed") as any,
  );
  const reason = encodeURIComponent(localizedReason);

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
    data: {
      items: localizePayload(result.items, req.locale),
      pagination: result.pagination,
    },
  });
};

// [GET] Get single order
export const getOrderController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const orderId = req.params.id as string;

  const order = await orderService.getOrder(orderId, userId);

  return res.status(200).json({
    status: "success",
    data: {
      order: localizePayload(order, req.locale),
    },
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
      message: req.t("order.success.cancelled"),
      order: localizePayload(order, req.locale),
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
      message: req.t("order.success.adminCancelled"),
      order: localizePayload(order, req.locale),
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
      items: localizePayload(maskedItems, req.locale),
      pagination: result.pagination,
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
    data: {
      order: localizePayload(maskedOrder, req.locale),
    },
  });
};