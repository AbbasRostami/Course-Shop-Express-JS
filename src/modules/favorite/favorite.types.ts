import { Prisma } from "../../../generated/prisma/client.js";

// [DB] Course favorite include with category and counts
export const courseFavoriteInclude = {
  course: {
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: {
          enrollments: true,
          comments: true,
        },
      },
    },
  },
} satisfies Prisma.CourseFavoriteInclude;

// [DB] Post favorite include with category and counts
export const postFavoriteInclude = {
  post: {
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: { comments: true },
      },
    },
  },
} satisfies Prisma.BlogFavoriteInclude;

// [TYPE] Course favorite with relations payload
export type CourseFavoriteWithRelations = Prisma.CourseFavoriteGetPayload<{
  include: typeof courseFavoriteInclude;
}>;

// [TYPE] Post favorite with relations payload
export type PostFavoriteWithRelations = Prisma.BlogFavoriteGetPayload<{
  include: typeof postFavoriteInclude;
}>;