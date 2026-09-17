import { Prisma } from "../../../generated/prisma/client.js";

// [DB] Cart include with items and course details (bilingual)
export const cartInclude = {
  items: {
    include: {
      course: {
        select: {
          id: true,
          titleFa: true,
          titleEn: true,
          slugFa: true,
          slugEn: true,
          imageUrl: true,
          price: true,
          level: true,
          published: true,
          category: {
            select: {
              id: true,
              nameFa: true,
              nameEn: true,
              slugFa: true,
              slugEn: true,
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
