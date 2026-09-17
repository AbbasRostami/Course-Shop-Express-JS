import { Prisma } from "../../../generated/prisma/client.js";

// [DB] Order detail include - full item info (bilingual)
export const orderDetailInclude = {
  items: {
    select: {
      id: true,
      courseId: true,
      courseTitleFa: true,
      courseTitleEn: true,
      courseSlugFa: true,
      courseSlugEn: true,
      courseImageUrl: true,
      price: true,
      createdAt: true,
    },
  },
} satisfies Prisma.OrderInclude;

// [DB] Order list include - minimal item info (bilingual)
export const orderListInclude = {
  items: {
    select: {
      id: true,
      courseTitleFa: true,
      courseTitleEn: true,
      price: true,
    },
  },
} satisfies Prisma.OrderInclude;

// [DB] Admin order include - with user info (bilingual)
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
      courseTitleFa: true,
      courseTitleEn: true,
      courseSlugFa: true,
      courseSlugEn: true,
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
