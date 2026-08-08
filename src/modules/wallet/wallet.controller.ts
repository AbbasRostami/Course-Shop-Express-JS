import { RequestHandler } from "express";
import { maskFields } from "../../utils/mask.js";
import { walletService } from "./wallet.service.js";
import {
  ListAdminTransactionsQuery,
  ListUserTransactionsQuery,
  ListWalletsAdminQuery,
} from "./wallet.validator.js";

// [CONFIG] Frontend base URL for redirects
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// [GET] Get wallet balance
export const getWalletBalanceController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const wallet = await walletService.getWalletBalance(userId);

  return res.status(200).json({
    status: "success",
    data: { wallet },
  });
};

// [POST] Charge wallet - returns ZarinPal payment URL
export const chargeWalletController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const result = await walletService.chargeWallet(userId, req.body);

  return res.status(200).json({
    status: "success",
    data: {
      message: "لطفاً برای پرداخت به آدرس زیر مراجعه کنید",
      paymentUrl: result.paymentUrl,
      transactionId: result.transaction.id,
      authority: result.authority,
    },
  });
};

// [GET] Verify ZarinPal callback and redirect
export const verifyPaymentController: RequestHandler = async (req, res) => {
  const Authority = req.query.Authority as string;
  const Status = req.query.Status as string;

  if (!Authority || !Status) {
    return res.redirect(`${FRONTEND_URL}/payment/failed?reason=invalid_callback`);
  }

  const result = await walletService.verifyPayment(Authority, Status);

  if (result.success && result.transaction) {
    const params = new URLSearchParams({
      status: "success",
      refId: result.refId || "",
      amount: String(result.transaction.amount),
      newBalance: String(result.newBalance),
      transactionId: result.transaction.id,
    });

    return res.redirect(`${FRONTEND_URL}/payment/success?${params.toString()}`);
  }

  const params = new URLSearchParams({
    status: "failed",
    reason: result.reason || "خطا در پرداخت",
    authority: Authority || "",
  });

  return res.redirect(`${FRONTEND_URL}/payment/failed?${params.toString()}`);
};

// [GET] Get user transactions list
export const getUserTransactionsController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;

  const result = await walletService.getUserTransactions(
    userId,
    req.query as ListUserTransactionsQuery,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

// [GET] Admin list all wallets with masked fields
export const getAllWalletsController: RequestHandler = async (req, res) => {
  const result = await walletService.getAllWallets(req.query as ListWalletsAdminQuery);

  // [SECURITY] Mask email and phone in wallet list
  const maskedItems = maskFields(result.items, ["user.email", "user.phone"]);

  return res.status(200).json({
    status: "success",
    data: { ...result, items: maskedItems },
  });
};

// [GET] Admin list all transactions with masked email
export const getAllTransactionsController: RequestHandler = async (req, res) => {
  const result = await walletService.getAllTransactions(
    req.query as ListAdminTransactionsQuery,
  );

  // [SECURITY] Mask user email in transaction list
  const maskedItems = maskFields(result.items, ["user.email"]);

  return res.status(200).json({
    status: "success",
    data: { ...result, items: maskedItems },
  });
};