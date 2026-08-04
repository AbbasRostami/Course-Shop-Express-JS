import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  calculateDiscountAmount,
  validateDiscount,
} from "../discount/discount.service.js";
import { cartInclude, CartWithItems } from "./cart.types.js";

// [UTIL] Format cart for response
const formatCart = (cart: CartWithItems) => {
  const formattedItems = cart.items.map((item) => ({
    id: item.id,
    courseId: item.course.id,
    title: item.course.title,
    slug: item.course.slug,
    price: item.course.price,
    imageUrl: item.course.imageUrl,
    level: item.course.level,
    category: item.course.category,
    addedAt: item.createdAt,
  }));

  const totalAmount = formattedItems.reduce((sum, i) => sum + i.price, 0);

  return {
    id: cart.id,
    totalAmount,
    totalItems: formattedItems.length,
    items: formattedItems,
  };
};

export const cartService = {
  // [DB] Get existing cart or create new one
  async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: cartInclude,
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: cartInclude,
      });
    }

    return cart;
  },

  // [LOGIC] Add course to cart
  async addItem(userId: string, courseId: string) {
    // [DB] Validate course exists and is published
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        published: true,
        category: { show: true },
      },
      select: { id: true, title: true, price: true },
    });

    if (!course) {
      throw new AppError("دوره مورد نظر یافت نشد یا غیرفعال است", 404);
    }

    // [LOGIC] Block free courses
    if (course.price === 0) {
      throw new AppError(
        "دوره‌های رایگان نیازی به سبد خرید ندارند. مستقیم ثبت‌نام کنید",
        400,
      );
    }

    // [DB] Check enrollment
    const isEnrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (isEnrolled) {
      throw new AppError("شما قبلاً این دوره را خریداری کرده‌اید", 400);
    }

    const cart = await this.getOrCreateCart(userId);

    // [LOGIC] Prevent duplicates
    const alreadyInCart = cart.items.some((i) => i.courseId === courseId);
    if (alreadyInCart) {
      throw new AppError("این دوره از قبل در سبد خرید شما موجود است", 409);
    }

    // [DB] Add item to cart
    await prisma.cartItem.create({
      data: { cartId: cart.id, courseId },
    });

    return { message: "دوره به سبد خرید اضافه شد" };
  },

  // [LOGIC] Get cart with discount calculation
  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const formatted = formatCart(cart);

    const { totalAmount, ...rest } = formatted;
    const subtotal = totalAmount;

    // [LOGIC] Apply discount if exists
    if (cart.discountCode) {
      try {
        const discount = await validateDiscount(cart.discountCode);
        const amount = calculateDiscountAmount(subtotal, discount);

        return {
          ...rest,
          subtotal,
          discount: {
            code: discount.code,
            type: discount.type,
            value: discount.value,
            amount,
          },
          totalPayment: subtotal - amount,
        };
      } catch {
        // [DB] Clear invalid discount code
        await prisma.cart.update({
          where: { userId },
          data: { discountCode: null },
        });
      }
    }

    return {
      ...rest,
      subtotal,
      discount: null,
      totalPayment: subtotal,
    };
  },

  // [DB] Remove course from cart
  async removeItem(userId: string, courseId: string) {
    const cart = await this.getOrCreateCart(userId);

    const item = cart.items.find((i) => i.courseId === courseId);
    if (!item) {
      throw new AppError("این دوره در سبد خرید شما یافت نشد", 404);
    }

    await prisma.cartItem.delete({
      where: { id: item.id },
    });

    return { message: "دوره از سبد خرید حذف شد" };
  },

  // [DB] Clear all cart items
  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { message: "سبد خرید با موفقیت خالی شد" };
  },
};