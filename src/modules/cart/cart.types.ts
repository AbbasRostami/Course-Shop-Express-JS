import { Prisma } from "../../../generated/prisma/client.js";

// [DB] Cart include with items and course details
export const cartInclude = {
  items: {
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          imageUrl: true,
          price: true,
          level: true,
          published: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              show: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.CartInclude;

// [TYPE] Cart with items payload
export type CartWithItems = Prisma.CartGetPayload<{
  include: typeof cartInclude;
}>;