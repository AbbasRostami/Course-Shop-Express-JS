import { prisma } from "../../lib/prisma.js";

// [UTIL] Build common date ranges for stats queries
const getDateRanges = () => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThisWeek = new Date(startOfToday);
  startOfThisWeek.setDate(startOfToday.getDate() - 7);
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const next7Days = new Date(now);
  next7Days.setDate(next7Days.getDate() + 7);

  return { now, startOfToday, startOfThisWeek, startOfThisMonth, next7Days };
};

export const overviewService = {
  // [DB] Aggregate all admin stats in parallel
  async getAdminOverview() {
    const [
      userStats,
      courseStats,
      orderStats,
      revenueStats,
      discountStats,
      commentStats,
      postStats,
      enrollmentStats,
    ] = await Promise.all([
      this.getAdminUserStats(),
      this.getAdminCourseStats(),
      this.getAdminOrderStats(),
      this.getAdminRevenueStats(),
      this.getAdminDiscountStats(),
      this.getAdminCommentStats(),
      this.getAdminPostStats(),
      this.getAdminEnrollmentStats(),
    ]);

    return {
      user: userStats,
      course: courseStats,
      order: orderStats,
      revenue: revenueStats,
      discount: discountStats,
      comment: commentStats,
      post: postStats,
      enrollment: enrollmentStats,
    };
  },

  // [DB] User counts - total, verified, admins, new
  async getAdminUserStats() {
    const { startOfThisWeek, startOfThisMonth } = getDateRanges();

    const [total, verified, admins, newThisWeek, newThisMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { createdAt: { gte: startOfThisWeek } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    ]);

    return {
      total,
      verified,
      unverified: total - verified,
      admins,
      regular: total - admins,
      newThisWeek,
      newThisMonth,
    };
  },

  // [DB] Course counts - total, published, enrollments
  async getAdminCourseStats() {
    const [total, published, totalEnrollments] = await Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: { published: true } }),
      prisma.enrollment.count(),
    ]);

    return {
      total,
      published,
      unpublished: total - published,
      totalEnrollments,
    };
  },

  // [DB] Order counts - total, by status, today
  async getAdminOrderStats() {
    const { startOfToday } = getDateRanges();

    const [total, pending, paid, cancelled, todayOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    ]);

    return { total, pending, paid, cancelled, today: todayOrders };
  },

  // [DB] Revenue stats - sales and wallet charges by date range
  async getAdminRevenueStats() {
    const { startOfToday, startOfThisWeek, startOfThisMonth } = getDateRanges();

    const whereOrderPaid = { status: "PAID" as const };
    const whereChargeSuccess = {
      type: "CHARGE" as const,
      status: "SUCCESS" as const,
    };

    const [
      salesTotal, salesToday, salesThisWeek, salesThisMonth,
      chargeTotal, chargeToday, chargeThisWeek, chargeThisMonth,
    ] = await Promise.all([
      // [DB] Sales aggregates
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: whereOrderPaid }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { ...whereOrderPaid, createdAt: { gte: startOfToday } } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { ...whereOrderPaid, createdAt: { gte: startOfThisWeek } } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { ...whereOrderPaid, createdAt: { gte: startOfThisMonth } } }),
      // [DB] Wallet charge aggregates
      prisma.transaction.aggregate({ _sum: { amount: true }, where: whereChargeSuccess }),
      prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...whereChargeSuccess, createdAt: { gte: startOfToday } } }),
      prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...whereChargeSuccess, createdAt: { gte: startOfThisWeek } } }),
      prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...whereChargeSuccess, createdAt: { gte: startOfThisMonth } } }),
    ]);

    return {
      sales: {
        total: salesTotal._sum.totalAmount ?? 0,
        today: salesToday._sum.totalAmount ?? 0,
        thisWeek: salesThisWeek._sum.totalAmount ?? 0,
        thisMonth: salesThisMonth._sum.totalAmount ?? 0,
      },
      walletCharges: {
        total: chargeTotal._sum.amount ?? 0,
        today: chargeToday._sum.amount ?? 0,
        thisWeek: chargeThisWeek._sum.amount ?? 0,
        thisMonth: chargeThisMonth._sum.amount ?? 0,
      },
    };
  },

  // [DB] Discount stats - active, expiring, top used
  async getAdminDiscountStats() {
    const { next7Days } = getDateRanges();

    const [total, active, expiringThisWeek, topUsed] = await Promise.all([
      prisma.discount.count(),
      prisma.discount.count({ where: { active: true } }),
      // [DB] Active discounts expiring within 7 days
      prisma.discount.findMany({
        where: { active: true, expiresAt: { lte: next7Days } },
        select: { id: true, code: true, type: true, value: true, expiresAt: true },
        take: 5,
        orderBy: { expiresAt: "asc" },
      }),
      // [DB] Top 5 most used discounts
      prisma.discount.findMany({
        select: { id: true, code: true, type: true, value: true, usedCount: true, maxUses: true },
        take: 5,
        orderBy: { usedCount: "desc" },
      }),
    ]);

    return { total, active, expiringThisWeek, topUsed };
  },

  // [DB] Comment stats - by status and latest pending
  async getAdminCommentStats() {
    const [total, approved, pending, rejected, latestPending] = await Promise.all([
      prisma.comment.count(),
      prisma.comment.count({ where: { status: "APPROVED" } }),
      prisma.comment.count({ where: { status: "PENDING" } }),
      prisma.comment.count({ where: { status: "REJECTED" } }),
      // [DB] Latest 5 pending comments with context
      prisma.comment.findMany({
        where: { status: "PENDING" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true, slug: true } },
          post: { select: { id: true, title: true, slug: true } },
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return { total, approved, pending, rejected, latestPending };
  },

  // [DB] Post counts - total, published
  async getAdminPostStats() {
    const [total, published] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
    ]);

    return { total, published, unpublished: total - published };
  },

  // [DB] Enrollment stats - total, by date, top courses
  async getAdminEnrollmentStats() {
    const { startOfThisWeek, startOfThisMonth } = getDateRanges();

    const [total, thisWeekCount, thisMonthCount, topCourses] = await Promise.all([
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { createdAt: { gte: startOfThisWeek } } }),
      prisma.enrollment.count({ where: { createdAt: { gte: startOfThisMonth } } }),
      // [DB] Top 5 courses by enrollment count
      prisma.course.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          imageUrl: true,
          _count: { select: { enrollments: true } },
        },
        take: 5,
        orderBy: { enrollments: { _count: "desc" } },
      }),
    ]);

    return {
      total,
      thisWeek: thisWeekCount,
      thisMonth: thisMonthCount,
      topCourses: topCourses.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        imageUrl: c.imageUrl,
        enrollments: c._count.enrollments,
      })),
    };
  },
};