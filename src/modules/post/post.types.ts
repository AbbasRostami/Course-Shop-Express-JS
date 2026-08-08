import { Prisma } from "../../../generated/prisma/client.js";
import { CreatePostInput, UpdatePostInput } from "./post.validator.js";

// [TYPE] Create input with optional image URL
export type CreatePostInputWithImage = CreatePostInput & {
  imageUrl?: string;
};

// [TYPE] Update input with optional image URL
export type UpdatePostInputWithImage = UpdatePostInput & {
  imageUrl?: string;
};

// [DB] Post include with category and comment count
export const postInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  _count: {
    select: { comments: true },
  },
} satisfies Prisma.PostInclude;

export type PostWithRelations = Prisma.PostGetPayload<{
  include: typeof postInclude;
}>;

// [TYPE] Formatted post with stats replacing _count
export type PostWithStats = Omit<PostWithRelations, "_count" | "categoryId"> & {
  stats: {
    comments: number;
  };
};