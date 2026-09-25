import i18next from "i18next";
import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import {
  requestPayment,
  verifyPayment as zarinpalVerify,
} from "../../utils/zarinpal.js";
import {
  ChargeWalletInput,
  ListAdminTransactionsQuery,
  ListUserTransactionsQuery,
  ListWalletsAdminQuery,
} from "./wallet.validator.js";

// [DB] Wallet include with user info
const walletWithUser = {
  user: {
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatar: true,
    },
  },
};

// [DB] Transaction include with user and course (bilingual)
const transactionWithUser = {
  user: {
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
    },
  },
  course: {
    select: {
      id: true,
      titleFa: true,
      titleEn: true,
      slugFa: true,
      slugEn: true,
    },
  },
};

export const walletService = {
  // [DB] Get or create wallet for user
  async getOrCreateWallet(userId: string) {
    return prisma.wallet.upsert({
      where: { userId },
      create: { userId, balance: 0 },
      update: {},
    });
  },

  // [DB] Get wallet balance
  async getWalletBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet;
  },

  // [PAYMENT] Initiate wallet charge via ZarinPal (with locale support)
  async chargeWallet(
    userId: string,
    data: ChargeWalletInput,
    locale: "fa" | "en",
  ) {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new AppError("wallet.errors.backendUrlNotDefined", 500);
    }

    const [_, user] = await Promise.all([
      this.getOrCreateWallet(userId),
      prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, phone: true },
      }),
    ]);

    if (!user) {
      throw new AppError("wallet.errors.userNotFound", 404);
    }

    const description = i18next.t("wallet.description.charge", {
      amount: data.amount,
      lng: locale,
    });

    // [PAYMENT] Request authority from ZarinPal
    const zarinpalResult = await requestPayment({
      amount: data.amount,
      description,
      callbackUrl: `${backendUrl}/api/wallet/verify`,
      email: user.email,
      mobile: user.phone || undefined,
    });

    if (!zarinpalResult.success || !zarinpalResult.authority) {
      throw new AppError(
        zarinpalResult.error || "zarinpal.errors.connectionError",
        500,
      );
    }

    const dbDescription = i18next.t("wallet.description.chargeSimple", {
      lng: locale,
    });

    // [DB] Store pending transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: data.amount,
        type: "CHARGE",
        status: "PENDING",
        authority: zarinpalResult.authority,
        description: dbDescription,
        userId,
      },
    });

    return {
      transaction,
      paymentUrl: zarinpalResult.paymentUrl,
      authority: zarinpalResult.authority,
    };
  },

  // [PAYMENT] Verify ZarinPal callback and credit wallet
  async verifyPayment(authority: string, status: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { authority },
    });

    if (!transaction) {
      return {
        success: false,
        reason: "wallet.errors.transactionNotFound",
        transaction: null,
        newBalance: null,
        refId: null,
      };
    }

    // [LOGIC] Skip if already processed
    if (transaction.status !== "PENDING") {
      return {
        success: transaction.status === "SUCCESS",
        reason:
          transaction.status !== "SUCCESS"
            ? "wallet.errors.alreadyProcessed"
            : undefined,
        transaction,
        newBalance: null,
        refId: null,
      };
    }

    // [LOGIC] User cancelled payment
    if (status === "NOK") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "CANCELLED" },
      });

      return {
        success: false,
        reason: "wallet.errors.cancelledByCustomer",
        transaction,
        newBalance: null,
        refId: null,
      };
    }

    // [PAYMENT] Verify with ZarinPal
    const verifyResult = await zarinpalVerify({
      authority,
      amount: transaction.amount,
    });

    if (!verifyResult.success) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "FAILED" },
      });

      return {
        success: false,
        reason: verifyResult.error || "wallet.errors.paymentFailed",
        transaction,
        newBalance: null,
        refId: null,
      };
    }

    // [DB] Finalize - update transaction and credit wallet
    const result = await prisma.$transaction(async (tx) => {
      const updatedTransaction = await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: "SUCCESS", refId: verifyResult.refId },
      });

      const updatedWallet = await tx.wallet.update({
        where: { userId: transaction.userId },
        data: { balance: { increment: transaction.amount } },
      });

      return { transaction: updatedTransaction, wallet: updatedWallet };
    });

    return {
      success: true,
      transaction: result.transaction,
      newBalance: result.wallet.balance,
      refId: verifyResult.refId,
      reason: undefined,
    };
  },

  // [DB] Get user transactions with filters
  async getUserTransactions(userId: string, query: ListUserTransactionsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.TransactionWhereInput = { userId };

    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          course: {
            select: {
              id: true,
              titleFa: true,
              titleEn: true,
              slugFa: true,
              slugEn: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      items,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Admin get all wallets with filters
  async getAllWallets(query: ListWalletsAdminQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.WalletWhereInput = {};

    // [LOGIC] Balance range filter
    if (query.minBalance || query.maxBalance) {
      where.balance = {};
      if (query.minBalance) where.balance.gte = Number(query.minBalance);
      if (query.maxBalance) where.balance.lte = Number(query.maxBalance);
    }

    // [LOGIC] Search by user email or name
    if (query.search) {
      where.user = {
        OR: [
          { email: { contains: query.search, mode: "insensitive" } },
          { name: { contains: query.search, mode: "insensitive" } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      prisma.wallet.findMany({
        where,
        skip,
        take,
        orderBy: { balance: "desc" },
        include: walletWithUser,
      }),
      prisma.wallet.count({ where }),
    ]);

    return {
      items,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Admin get all transactions with filters
  async getAllTransactions(query: ListAdminTransactionsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.TransactionWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;

    // [LOGIC] Date range filter
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: transactionWithUser,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      items,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },
};
