import { Prisma } from "../../../generated/prisma/client.js";

// [DB] Base comment include - user and counts
export const commentBaseInclude = {
  user: {
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  },
  _count: {
    select: {
      replies: true,
      reactions: true,
    },
  },
} satisfies Prisma.CommentInclude;

// [DB] Admin comment include - with parent, course and post
export const commentAdminInclude = {
  user: {
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  },
  parent: {
    select: {
      id: true,
      content: true,
      status: true,
    },
  },
  course: {
    select: {
      id: true,
      title: true,
      slug: true,
    },
  },
  post: {
    select: {
      id: true,
      title: true,
      slug: true,
    },
  },
  _count: {
    select: {
      replies: true,
      reactions: true,
    },
  },
} satisfies Prisma.CommentInclude;

export type CommentWithUser = Prisma.CommentGetPayload<{
  include: typeof commentBaseInclude;
}>;

export type CommentWithMeta = Prisma.CommentGetPayload<{
  include: typeof commentAdminInclude;
}>;

// [TYPE] Comment with stats replacing _count
export type CommentWithStats = Omit<CommentWithUser, "_count"> & {
  stats: CommentWithUser["_count"];
};

// [TYPE] Admin comment with stats replacing _count
export type CommentMetaWithStats = Omit<CommentWithMeta, "_count"> & {
  stats: CommentWithMeta["_count"];
};

// [TYPE] Recursive comment tree node
export type CommentTreeNode = CommentWithStats & {
  replies: CommentTreeNode[];
};

// [TYPE] Comment reaction state
export type CommentReactionState = {
  likes: number;
  dislikes: number;
  myReaction: "LIKE" | "DISLIKE" | null;
};

// [TYPE] Comment tree node with reactions
export type CommentTreeNodeWithReactions = CommentTreeNode & {
  reactions: CommentReactionState;
  replies: CommentTreeNodeWithReactions[];
};