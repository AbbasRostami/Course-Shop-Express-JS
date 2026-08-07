import { Prisma } from "../../../generated/prisma/client.js";

// [DB] Order detail include - full item info
export const orderDetailInclude = {
  items: {
    select: {
      id: true,
      courseId: true,
      courseTitle: true,
      courseSlug: true,
      courseImageUrl: true,
      price: true,
      createdAt: true,
    },
  },
} satisfies Prisma.OrderInclude;

// [DB] Order list include - minimal item info
export const orderListInclude = {
  items: {
    select: {
      id: true,
      courseTitle: true,
      price: true,
    },
  },
} satisfies Prisma.OrderInclude;

// [DB] Admin order include - with user info
export const orderAdminInclude = {
  user: {
    select: {
      id: true,
      email: true,
      name: true,
    },
  },
  items: {
    select: {
      id: true,
      courseId: true,
      courseTitle: true,
      courseSlug: true,
      courseImageUrl: true,
      price: true,
      createdAt: true,
    },
  },
} satisfies Prisma.OrderInclude;

export type OrderAdminItem = Prisma.OrderGetPayload<{
  include: typeof orderAdminInclude;
}>;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: typeof orderDetailInclude;
}>;

export type OrderListItem = Prisma.OrderGetPayload<{
  include: typeof orderListInclude;
}>;