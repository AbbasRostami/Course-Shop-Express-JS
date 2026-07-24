import { RequestHandler } from "express";
import { maskFields } from "../../utils/mask.js";
import { walletService } from "./wallet.service.js";
import {
  ListAdminTransactionsQuery,
  ListUserTransactionsQuery,
  ListWalletsAdminQuery,
} from "./wallet.validator.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const getWalletBalanceController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;

  const wallet = await walletService.getWalletBalance(userId);

  return res.status(200).json({
    status: "success",
    data: { wallet },
  });
};

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

export const verifyPaymentController: RequestHandler = async (req, res) => {
  const Authority = req.query.Authority as string;
  const Status = req.query.Status as string;

  if (!Authority || !Status) {
    return res.redirect(
      `${FRONTEND_URL}/payment/failed?reason=invalid_callback`,
    );
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

export const getUserTransactionsController: RequestHandler = async (
  req,
  res,
) => {
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

export const getAllWalletsController: RequestHandler = async (req, res) => {
  const result = await walletService.getAllWallets(
    req.query as ListWalletsAdminQuery,
  );

  const maskedItems = maskFields(result.items, ["user.email", "user.phone"]);

  return res.status(200).json({
    status: "success",
    data: {
      ...result,
      items: maskedItems,
    },
  });
};

export const getAllTransactionsController: RequestHandler = async (
  req,
  res,
) => {
  const result = await walletService.getAllTransactions(
    req.query as ListAdminTransactionsQuery,
  );

  const maskedItems = maskFields(result.items, ["user.email"]);

  return res.status(200).json({
    status: "success",
    data: {
      ...result,
      items: maskedItems,
    },
  });
};
