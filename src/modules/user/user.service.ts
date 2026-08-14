import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { removeCloudinaryImage } from "../../utils/cloudinary.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import {
  ListBannedUsersQuery,
  ListUsersQuery,
  UpdateProfileInput,
} from "./user.validator.js";

export const userService = {
  // [DB] Get current user profile
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError("کاربر مورد نظر یافت نشد", 404);
    }

    return user;
  },

  // [DB] Update user profile with optional avatar
  async updateProfile(
    userId: string,
    data: UpdateProfileInput & { avatar?: string },
  ) {
    // [CLEANUP] Remove old avatar before setting new one
    if (data.avatar) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatar: true },
      });

      if (currentUser?.avatar) {
        await removeCloudinaryImage(currentUser.avatar);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
      },
    });

    return updatedUser;
  },

  // [DB] Remove user avatar
  async deleteAvatar(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    // [CLEANUP] Remove image from Cloudinary
    if (user?.avatar) {
      await removeCloudinaryImage(user.avatar);
    }

    return prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
      select: { id: true, avatar: true },
    });
  },

  // [DB] Get user activity overview
  async getProfileOverview(userId: string) {
    const [
      enrollments,
      orders,
      pendingOrders,
      wallet,
      comments,
      pendingComments,
      favoriteCourses,
      favoritePosts,
      cartItems,
      reactions,
    ] = await Promise.all([
      prisma.enrollment.count({ where: { userId } }),
      prisma.order.count({ where: { userId } }),
      prisma.order.count({ where: { userId, status: "PENDING" } }),
      prisma.wallet.findUnique({
        where: { userId },
        select: { balance: true },
      }),
      prisma.comment.count({ where: { userId } }),
      prisma.comment.count({ where: { userId, status: "PENDING" } }),
      prisma.courseFavorite.count({ where: { userId } }),
      prisma.blogFavorite.count({ where: { userId } }),
      prisma.cartItem.count({ where: { cart: { userId } } }),
      prisma.reaction.count({ where: { userId } }),
    ]);

    return {
      enrollment: { total: enrollments },
      order: { total: orders, active: pendingOrders },
      wallet: { balance: wallet?.balance ?? 0 },
      comment: { total: comments, pending: pendingComments },
      favorite: { courses: favoriteCourses, posts: favoritePosts },
      cart: { items: cartItems },
      reaction: { total: reactions },
    };
  },

  // [DB] Admin get paginated users with filters
  async getUsers(query: ListUsersQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.UserWhereInput = {};

    if (query.role) where.role = query.role;
    if (query.isVerified !== undefined) where.isVerified = query.isVerified === "true";
    if (query.isBanned !== undefined) where.isBanned = query.isBanned === "true";

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const sortBy = query.sortBy || "createdAt";
    const order = query.order || "desc";

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: order },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          role: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              enrollments: true,
              orders: true,
              comments: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // [UTIL] Flatten _count into stats
    const formattedItems = items.map(({ _count, ...user }) => ({
      ...user,
      stats: {
        enrollments: _count.enrollments,
        orders: _count.orders,
        comments: _count.comments,
      },
    }));

    return {
      items: formattedItems,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Admin get single user with stats
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        wallet: { select: { balance: true } },
        _count: {
          select: {
            enrollments: true,
            orders: true,
            comments: true,
            favoriteCourses: true,
            favoriteBlogs: true,
            reactions: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("کاربر مورد نظر یافت نشد", 404);
    }

    const { _count, wallet, ...rest } = user;

    return {
      ...rest,
      walletBalance: wallet?.balance ?? 0,
      // [UTIL] Flatten _count into stats
      stats: {
        enrollments: _count.enrollments,
        orders: _count.orders,
        comments: _count.comments,
        favoriteCourses: _count.favoriteCourses,
        favoritePosts: _count.favoriteBlogs,
        reactions: _count.reactions,
      },
    };
  },

  // [DB] Admin get paginated banned users
  async getBannedUsers(query: ListBannedUsersQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where: { isBanned: true },
        skip,
        take,
        orderBy: { bannedAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          isBanned: true,
          bannedAt: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where: { isBanned: true } }),
    ]);

    return {
      items,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Admin ban user and invalidate session
  async banUser(id: string, currentUserId: string) {
    // [LOGIC] Block self-ban
    if (id === currentUserId) {
      throw new AppError("نمی‌توانید خودتان را مسدود کنید", 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new AppError("کاربر یافت نشد", 404);
    }

    // [LOGIC] Block banning admin
    if (user.role === "ADMIN") {
      throw new AppError("امکان مسدود کردن ادمین وجود ندارد", 409);
    }

    if (user.isBanned) {
      throw new AppError("کاربر قبلاً مسدود شده است", 422);
    }

    return prisma.user.update({
      where: { id },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        refreshToken: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isBanned: true,
        bannedAt: true,
      },
    });
  },

  // [DB] Admin unban user
  async unbanUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new AppError("کاربر یافت نشد", 404);
    }

    if (!user.isBanned) {
      throw new AppError("کاربر مسدود نیست", 400);
    }

    return prisma.user.update({
      where: { id },
      data: { isBanned: false, bannedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        isBanned: true,
      },
    });
  },
};