import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  chargeWalletController,
  getAllTransactionsController,
  getAllWalletsController,
  getUserTransactionsController,
  getWalletBalanceController,
  verifyPaymentController,
} from "./wallet.controller.js";
import {
  chargeWalletSchema,
  listAdminTransactionsSchema,
  listUserTransactionsSchema,
  listWalletsAdminSchema,
} from "./wallet.validator.js";

const router = Router();

// [GET] Admin list all wallets
router.get(
  "/admin/wallets",
  authentication,
  authorize("ADMIN"),
  validate(listWalletsAdminSchema),
  asyncHandler(getAllWalletsController),
);

// [GET] Admin list all transactions
router.get(
  "/admin/transactions",
  authentication,
  authorize("ADMIN"),
  validate(listAdminTransactionsSchema),
  asyncHandler(getAllTransactionsController),
);

// [GET] Get wallet balance
router.get("/", authentication, asyncHandler(getWalletBalanceController));

// [POST] Charge wallet via ZarinPal
router.post(
  "/charge",
  authentication,
  validate(chargeWalletSchema),
  asyncHandler(chargeWalletController),
);

// [GET] ZarinPal payment callback (public)
router.get("/verify", asyncHandler(verifyPaymentController));

// [GET] Get user transactions
router.get(
  "/transactions",
  authentication,
  validate(listUserTransactionsSchema),
  asyncHandler(getUserTransactionsController),
);

export default router;