import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  adminCancelOrderController,
  cancelOrderController,
  checkoutWalletController,
  checkoutZarinpalController,
  getAdminOrderController,
  getAdminOrdersController,
  getMyOrdersController,
  getOrderController,
  verifyOrderController,
} from "./order.controller.js";
import {
  cancelOrderSchema,
  getAdminOrderSchema,
  getOrderSchema,
  listAdminOrdersSchema,
  listOrdersSchema,
} from "./order.validator.js";

const router = Router();

// [GET] ZarinPal payment callback (public - no auth)
router.get("/verify", asyncHandler(verifyOrderController));

// [MW] All routes below require auth
router.use(authentication);

// [GET] Admin list orders
router.get(
  "/admin",
  authorize("ADMIN"),
  validate(listAdminOrdersSchema),
  asyncHandler(getAdminOrdersController),
);

// [GET] Admin get single order
router.get(
  "/admin/:id",
  authorize("ADMIN"),
  validate(getAdminOrderSchema),
  asyncHandler(getAdminOrderController),
);

// [GET] My orders list
router.get(
  "/my-orders",
  validate(listOrdersSchema),
  asyncHandler(getMyOrdersController),
);

// [POST] Checkout with wallet
router.post("/checkout/wallet", asyncHandler(checkoutWalletController));

// [POST] Checkout with ZarinPal
router.post("/checkout/zarinpal", asyncHandler(checkoutZarinpalController));

// [GET] Get single order
router.get("/:id", validate(getOrderSchema), asyncHandler(getOrderController));

// [PATCH] Cancel order
router.patch(
  "/:id/cancel",
  validate(cancelOrderSchema),
  asyncHandler(cancelOrderController),
);

// [PATCH] Admin cancel order
router.patch(
  "/admin/:id/cancel",
  authorize("ADMIN"),
  validate(getAdminOrderSchema),
  asyncHandler(adminCancelOrderController),
);

export default router;