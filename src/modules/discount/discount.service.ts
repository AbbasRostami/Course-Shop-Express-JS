import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import {
  ApplyDiscountInput,
  CreateDiscountInput,
  ListDiscountsQuery,
} from "./discount.validator.js";

// [LOGIC] Validate discount code is usable
export const validateDiscount = async (code: string) => {
  const discount = await prisma.discount.findUnique({ where: { code } });

  if (!discount) {
    throw new AppError("کد تخفیف یافت نشد", 404);
  }

  if (!discount.active) {
    throw new AppError("این کد تخفیف غیرفعال است", 400);
  }

  if (discount.expiresAt < new Date()) {
    throw new AppError("این کد تخفیف منقضی شده است", 410);
  }

  if (discount.usedCount >= discount.maxUses) {
    throw new AppError("ظرفیت استفاده از این کد تمام شده است", 400);
  }

  return discount;
};

// [LOGIC] Calculate discount amount from subtotal
export const calculateDiscountAmount = (
  subtotal: number,
  discount: { type: string; value: number },
): number => {
  if (discount.type === "PERCENTAGE") {
    return Math.floor((subtotal * discount.value) / 100);
  }
  return Math.min(discount.value, subtotal);
};

export const discountService = {
  // [DB] Create new discount code
  async createDiscount(data: CreateDiscountInput) {
    const existing = await prisma.discount.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new AppError("کدی با این نام قبلاً ثبت شده است", 409, {
        code: "این کد قبلاً استفاده شده است",
      });
    }

    // [LOGIC] Calculate expiry date from days
    const expiresAt = new Date(
      Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000,
    );

    return prisma.discount.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        maxUses: data.maxUses,
        expiresAt,
      },
    });
  },

  // [DB] List discounts with filters and pagination
  async listDiscounts(query: ListDiscountsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.DiscountWhereInput = {};

    if (query.active !== undefined) {
      where.active = query.active === "true";
    }

    if (query.search) {
      where.code = { contains: query.search, mode: "insensitive" };
    }

    const [items, total] = await Promise.all([
      prisma.discount.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.discount.count({ where }),
    ]);

    return {
      items,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Toggle discount active status
  async toggleDiscount(id: string) {
    const discount = await prisma.discount.findUnique({ where: { id } });

    if (!discount) {
      throw new AppError("کد تخفیف یافت نشد", 404);
    }

    // [LOGIC] Block reactivation of expired discount
    if (!discount.active && discount.expiresAt < new Date()) {
      throw new AppError(
        "نمی‌توان کد منقضی شده را فعال کرد. ابتدا کد جدید بسازید",
        410,
      );
    }

    // [LOGIC] Block reactivation if usage limit reached
    if (!discount.active && discount.usedCount >= discount.maxUses) {
      throw new AppError(
        "نمی‌توان کد را فعال کرد، ظرفیت استفاده تمام شده است",
        400,
      );
    }

    return prisma.discount.update({
      where: { id },
      data: { active: !discount.active },
    });
  },

  // [DB] Delete discount code
  async deleteDiscount(id: string) {
    const discount = await prisma.discount.findUnique({ where: { id } });

    if (!discount) {
      throw new AppError("کد تخفیف یافت نشد", 404);
    }

    await prisma.discount.delete({ where: { id } });
  },

  // [DB] Apply discount code to user cart
  async applyDiscountToCart(userId: string, data: ApplyDiscountInput) {
    const discount = await validateDiscount(data.code);

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError("سبد خرید شما خالی است", 400);
    }

    await prisma.cart.update({
      where: { userId },
      data: { discountCode: discount.code },
    });

    return {
      message: "کد تخفیف با موفقیت اعمال شد",
      discount: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
      },
    };
  },

  // [DB] Remove discount code from user cart
  async removeDiscountFromCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      throw new AppError("سبد خرید یافت نشد", 404);
    }

    if (!cart.discountCode) {
      throw new AppError("کد تخفیفی در سبد شما نیست", 400);
    }

    await prisma.cart.update({
      where: { userId },
      data: { discountCode: null },
    });

    return { message: "کد تخفیف از سبد حذف شد" };
  },
};