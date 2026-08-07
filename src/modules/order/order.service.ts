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
import { cartInclude } from "../cart/cart.types.js";
import { calculateDiscountAmount } from "../discount/discount.service.js";
import {
  orderAdminInclude,
  orderDetailInclude,
  orderListInclude,
} from "./order.types.js";
import { ListAdminOrdersQuery, ListOrdersQuery } from "./order.validator.js";

// [DB] Find order by ID and verify ownership
const findUserOrder = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderDetailInclude,
  });

  if (!order) {
    throw new AppError("سفارش یافت نشد", 404);
  }

  if (order.userId !== userId) {
    throw new AppError("شما اجازه دسترسی به این سفارش را ندارید", 403);
  }

  return order;
};

// [DB] Find pending order - used before payment or cancel
const findPendingOrder = async (orderId: string, userId: string) => {
  const order = await findUserOrder(orderId, userId);

  if (order.status !== "PENDING") {
    throw new AppError(
      `این سفارش قابل پرداخت/لغو نیست (وضعیت: ${order.status})`,
      400,
    );
  }

  return order;
};

// [DB] Batch create enrollments from order items
const createEnrollments = async (
  userId: string,
  items: { courseId: string | null; price: number }[],
  tx: Prisma.TransactionClient,
) => {
  const data = items
    .filter((item) => item.courseId !== null)
    .map((item) => ({
      userId,
      courseId: item.courseId!,
      pricePaid: item.price,
    }));

  if (data.length > 0) {
    await tx.enrollment.createMany({
      data,
      skipDuplicates: true,
    });
  }
};

// [DB] Remove all items from user cart
const clearCartItems = async (userId: string, tx: Prisma.TransactionClient) => {
  const cart = await tx.cart.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (cart) {
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
};

// [DB] Validate cart and build order from items
const createOrderFromCart = async (
  userId: string,
  tx: Prisma.TransactionClient,
) => {
  const cart = await tx.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError("سبد خرید خالی است", 400);
  }

  const validItems: {
    courseId: string;
    title: string;
    slug: string;
    imageUrl: string | null;
    price: number;
  }[] = [];

  for (const item of cart.items) {
    const course = item.course;

    // [LOGIC] Block unavailable courses
    if (!course.published || !course.category?.show) {
      throw new AppError(`دوره "${course.title}" دیگر در دسترس نیست`, 400);
    }

    // [LOGIC] Block free courses in cart
    if (course.price === 0) {
      throw new AppError(
        `دوره رایگان "${course.title}" نباید در سبد خرید باشد`,
        400,
      );
    }

    // [DB] Check existing enrollment
    const enrolled = await tx.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });

    if (enrolled) {
      throw new AppError(
        `شما قبلاً دوره "${course.title}" را خریداری کرده‌اید`,
        400,
      );
    }

    validItems.push({
      courseId: course.id,
      title: course.title,
      slug: course.slug,
      imageUrl: course.imageUrl,
      price: course.price,
    });
  }

  const subtotal = validItems.reduce((sum, i) => sum + i.price, 0);

  let discountAmount = 0;
  let discountCode: string | null = null;

  // [LOGIC] Apply discount if valid
  if (cart.discountCode) {
    const discount = await tx.discount.findUnique({
      where: { code: cart.discountCode },
    });

    if (
      discount &&
      discount.active &&
      discount.expiresAt > new Date() &&
      discount.usedCount < discount.maxUses
    ) {
      discountAmount = calculateDiscountAmount(subtotal, discount);
      discountCode = discount.code;

      // [DB] Increment discount usage count
      await tx.discount.update({
        where: { id: discount.id },
        data: { usedCount: { increment: 1 } },
      });
    }
  }

  const totalAmount = subtotal - discountAmount;

  // [DB] Create order with items
  const order = await tx.order.create({
    data: {
      userId,
      subtotal,
      discountAmount,
      totalAmount,
      discountCode,
      status: "PENDING",
      items: {
        create: validItems.map((item) => ({
          courseId: item.courseId,
          courseTitle: item.title,
          courseSlug: item.slug,
          courseImageUrl: item.imageUrl,
          price: item.price,
        })),
      },
    },
    include: orderDetailInclude,
  });

  return order;
};

export const orderService = {
  // [PAYMENT] Checkout with wallet balance
  async checkoutWithWallet(userId: string) {
    const result = await prisma.$transaction(async (tx) => {
      const order = await createOrderFromCart(userId, tx);

      const wallet = await tx.wallet.findUnique({ where: { userId } });

      if (!wallet) {
        throw new AppError(
          "کیف پول یافت نشد. ابتدا کیف پول خود را شارژ کنید",
          404,
        );
      }

      // [LOGIC] Check sufficient balance
      if (wallet.balance < order.totalAmount) {
        throw new AppError(
          `موجودی کیف پول کافی نیست. موجودی: ${wallet.balance.toLocaleString()} ریال — مبلغ سفارش: ${order.totalAmount.toLocaleString()} ریال`,
          400,
        );
      }

      // [DB] Deduct from wallet
      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: order.totalAmount } },
      });

      // [DB] Create wallet transaction record
      await tx.transaction.create({
        data: {
          amount: order.totalAmount,
          type: "PURCHASE",
          status: "SUCCESS",
          description: `پرداخت سفارش #${order.id.slice(0, 8)}`,
          userId,
          orderId: order.id,
        },
      });

      // [DB] Mark order as paid
      const paidOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID", paymentMethod: "WALLET" },
        include: orderDetailInclude,
      });

      await createEnrollments(userId, order.items, tx);
      await clearCartItems(userId, tx);

      return { order: paidOrder, newBalance: updatedWallet.balance };
    });

    return result;
  },

  // [PAYMENT] Checkout with ZarinPal gateway
  async checkoutWithZarinpal(userId: string) {
    // [DB] Create pending order
    const order = await prisma.$transaction(async (tx) => {
      return createOrderFromCart(userId, tx);
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phone: true },
    });

    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new AppError("BACKEND_URL در محیط تعریف نشده است", 500);
    }

    // [PAYMENT] Request authority from ZarinPal
    const zarinpalResult = await requestPayment({
      amount: order.totalAmount,
      description: `پرداخت سفارش #${order.id.slice(0, 8)}`,
      callbackUrl: `${backendUrl}/api/orders/verify`,
      email: user?.email,
      mobile: user?.phone || undefined,
      orderId: order.id,
    });

    // [ERROR] Cancel order if gateway fails
    if (!zarinpalResult.success || !zarinpalResult.authority) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });

      throw new AppError(
        zarinpalResult.error || "خطا در ارتباط با درگاه پرداخت",
        500,
      );
    }

    // [DB] Store pending transaction with authority
    await prisma.transaction.create({
      data: {
        amount: order.totalAmount,
        type: "PURCHASE",
        status: "PENDING",
        authority: zarinpalResult.authority,
        description: `پرداخت سفارش #${order.id.slice(0, 8)}`,
        userId,
        orderId: order.id,
      },
    });

    return {
      orderId: order.id,
      paymentUrl: zarinpalResult.paymentUrl,
    };
  },

  // [PAYMENT] Verify ZarinPal callback
  async verifyZarinpal(authority: string, status: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { authority },
    });

    if (!transaction) {
      throw new AppError("تراکنش یافت نشد", 404);
    }

    // [LOGIC] Skip if already processed
    if (transaction.status !== "PENDING") {
      return {
        success: transaction.status === "SUCCESS",
        orderId: transaction.orderId,
        alreadyProcessed: true,
      };
    }

    // [LOGIC] User cancelled payment
    if (status === "NOK") {
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: "CANCELLED" },
        });

        if (transaction.orderId) {
          await tx.order.update({
            where: { id: transaction.orderId },
            data: { status: "CANCELLED" },
          });
        }
      });

      return {
        success: false,
        orderId: transaction.orderId,
        reason: "پرداخت توسط کاربر لغو شد",
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
        orderId: transaction.orderId,
        reason: verifyResult.error || "پرداخت ناموفق بود",
      };
    }

    // [DB] Finalize payment - update transaction, order, enrollments
    const result = await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: "SUCCESS", refId: verifyResult.refId },
      });

      const order = await tx.order.update({
        where: { id: transaction.orderId! },
        data: { status: "PAID", paymentMethod: "ZARINPAL" },
        include: orderDetailInclude,
      });

      await createEnrollments(transaction.userId, order.items, tx);
      await clearCartItems(transaction.userId, tx);

      return { order, refId: verifyResult.refId };
    });

    return {
      success: true,
      orderId: result.order.id,
      refId: result.refId,
    };
  },

  // [DB] Get user's orders with pagination
  async getMyOrders(userId: string, query: ListOrdersQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.OrderWhereInput = { userId };

    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: orderListInclude,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      items,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Get single order for user
  async getOrder(orderId: string, userId: string) {
    return findUserOrder(orderId, userId);
  },

  // [DB] Cancel pending order by user
  async cancelOrder(orderId: string, userId: string) {
    await findPendingOrder(orderId, userId);

    const cancelled = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
        include: orderDetailInclude,
      });

      // [DB] Cancel related pending transactions
      await tx.transaction.updateMany({
        where: { orderId, status: "PENDING" },
        data: { status: "CANCELLED" },
      });

      return updatedOrder;
    });

    return cancelled;
  },

  // [DB] Admin cancel order
  async adminCancelOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: orderAdminInclude,
    });

    if (!order) {
      throw new AppError("سفارش یافت نشد", 404);
    }

    if (order.status === "CANCELLED") {
      throw new AppError("این سفارش قبلاً لغو شده است", 400);
    }

    // [LOGIC] Block cancellation of paid orders
    if (order.status === "PAID") {
      throw new AppError(
        "امکان لغو سفارش پرداخت شده وجود ندارد.",
        400,
      );
    }

    const cancelled = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
        include: orderAdminInclude,
      });

      // [DB] Cancel related pending transactions
      await tx.transaction.updateMany({
        where: { orderId, status: "PENDING" },
        data: { status: "CANCELLED" },
      });

      return updatedOrder;
    });

    return cancelled;
  },

  // [DB] Admin get all orders with filters
  async getAdminOrders(query: ListAdminOrdersQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.OrderWhereInput = {};

    if (query.status) where.status = query.status;

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
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: orderAdminInclude,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      items,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Admin get single order by ID
  async getAdminOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: orderAdminInclude,
    });

    if (!order) {
      throw new AppError("سفارش یافت نشد", 404);
    }

    return order;
  },
};