import { CommentStatus, Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import { getReactionCountsForList } from "../../utils/reactionHelper.js";
import {
  CommentMetaWithStats,
  CommentReactionState,
  CommentTreeNode,
  CommentTreeNodeWithReactions,
  CommentWithMeta,
  CommentWithStats,
  CommentWithUser,
  commentAdminInclude,
  commentBaseInclude,
} from "./comment.types.js";
import {
  CreateCommentInput,
  ListAdminCommentsQuery,
  ListCourseCommentsQuery,
  ListMyCommentsQuery,
  ListPostCommentsQuery,
} from "./comment.validator.js";

// [UTIL] Format comment - replace _count with stats
const formatComment = (comment: CommentWithUser): CommentWithStats => {
  const { _count, ...rest } = comment;
  return { ...rest, stats: _count };
};

// [UTIL] Format admin comment - replace _count with stats
const formatAdminComment = (comment: CommentWithMeta): CommentMetaWithStats => {
  const { _count, ...rest } = comment;
  return { ...rest, stats: _count };
};

// [UTIL] Format list of admin comments
const formatAdminComments = (
  comments: CommentWithMeta[],
): CommentMetaWithStats[] => comments.map(formatAdminComment);

// [UTIL] Build nested comment tree from flat list
const buildCommentTree = (comments: CommentWithUser[]): CommentTreeNode[] => {
  const map = new Map<string, CommentTreeNode>();

  for (const comment of comments) {
    const { _count, ...rest } = comment;
    map.set(comment.id, {
      ...rest,
      stats: _count,
      replies: [],
    });
  }

  const roots: CommentTreeNode[] = [];

  for (const comment of comments) {
    const currentNode = map.get(comment.id)!;

    if (!comment.parentId) {
      roots.push(currentNode);
      continue;
    }

    const parentNode = map.get(comment.parentId);
    if (!parentNode) continue;

    parentNode.replies.push(currentNode);
  }

  // [UTIL] Sync reply counts from actual tree
  const syncCounts = (nodes: CommentTreeNode[]): CommentTreeNode[] => {
    return nodes.map((node) => ({
      ...node,
      stats: {
        ...node.stats,
        replies: node.replies.length,
      },
      replies: syncCounts(node.replies),
    }));
  };

  return syncCounts(roots);
};

// [UTIL] Attach reactions to comment tree nodes
const addReactionsToTree = (
  nodes: CommentTreeNode[],
  reactionMap: Map<string, CommentReactionState>,
): CommentTreeNodeWithReactions[] => {
  return nodes.map((node) => ({
    ...node,
    reactions: reactionMap.get(node.id) ?? {
      likes: 0,
      dislikes: 0,
      myReaction: null,
    },
    replies: addReactionsToTree(node.replies, reactionMap),
  }));
};

// [DB] Fetch all descendant comments recursively
const fetchCommentDescendants = async (
  whereBase: { courseId?: string; postId?: string },
  rootComments: CommentWithUser[],
): Promise<CommentWithUser[]> => {
  const allComments: CommentWithUser[] = [...rootComments];
  let parentIds = rootComments.map((comment) => comment.id);

  while (parentIds.length > 0) {
    const children = await prisma.comment.findMany({
      where: {
        ...whereBase,
        status: "APPROVED",
        parentId: { in: parentIds },
      },
      include: commentBaseInclude,
      orderBy: { createdAt: "asc" },
    });

    if (children.length === 0) break;

    allComments.push(...children);
    parentIds = children.map((comment) => comment.id);
  }

  return allComments;
};

export const commentService = {
  // [DB] Create new comment
  async createComment(userId: string, data: CreateCommentInput) {
    const { content, courseId, postId, parentId } = data;

    // [DB] Validate course exists and is published (Fa or En slug support)
    if (courseId) {
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          published: true,
          category: { show: true },
        },
        select: { id: true },
      });

      if (!course) {
        throw new AppError("comment.errors.courseNotFound", 404);
      }
    }

    // [DB] Validate post exists and is published (Fa or En slug support)
    if (postId) {
      const post = await prisma.post.findFirst({
        where: {
          id: postId,
          published: true,
          category: { show: true },
        },
        select: { id: true },
      });

      if (!post) {
        throw new AppError("comment.errors.postNotFound", 404);
      }
    }

    // [DB] Validate parent comment belongs to same target
    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, courseId: true, postId: true },
      });

      if (!parent) {
        throw new AppError("comment.errors.parentNotFound", 404);
      }

      if (courseId && parent.courseId !== courseId) {
        throw new AppError("comment.errors.parentCourseMismatch", 400);
      }

      if (postId && parent.postId !== postId) {
        throw new AppError("comment.errors.parentPostMismatch", 400);
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        courseId: courseId ?? null,
        postId: postId ?? null,
        parentId: parentId ?? null,
        status: "PENDING",
      },
      include: commentBaseInclude,
    });

    return formatComment(comment);
  },

  // [DB] Get paginated comment tree for a course
  async getCourseComments(
    slug: string,
    query: ListCourseCommentsQuery,
    userId?: string,
  ) {
    const { skip, take, page, limit } = parsePagination(query);

    const course = await prisma.course.findFirst({
      where: {
        OR: [{ slugFa: slug }, { slugEn: slug }],
        published: true,
        category: { show: true },
      },
      select: { id: true },
    });

    if (!course) {
      throw new AppError("comment.errors.courseNotFound", 404);
    }

    const rootWhere: Prisma.CommentWhereInput = {
      courseId: course.id,
      status: "APPROVED",
      parentId: null,
    };

    const [rootComments, totalRootComments] = await Promise.all([
      prisma.comment.findMany({
        where: rootWhere,
        skip,
        take,
        include: commentBaseInclude,
        orderBy: { createdAt: "asc" },
      }),
      prisma.comment.count({ where: rootWhere }),
    ]);

    const flatComments = await fetchCommentDescendants(
      { courseId: course.id },
      rootComments,
    );

    const tree = buildCommentTree(flatComments);

    const commentIds = flatComments.map((c) => c.id);
    const reactionMap = await getReactionCountsForList(
      "commentId",
      commentIds,
      userId,
    );

    const itemsWithReactions = addReactionsToTree(tree, reactionMap);

    return {
      items: itemsWithReactions,
      pagination: buildPaginationMeta(totalRootComments, page, limit),
    };
  },

  // [DB] Get paginated comment tree for a post
  async getPostComments(
    slug: string,
    query: ListPostCommentsQuery,
    userId?: string,
  ) {
    const { skip, take, page, limit } = parsePagination(query);

    const post = await prisma.post.findFirst({
      where: {
        OR: [{ slugFa: slug }, { slugEn: slug }],
        published: true,
        category: { show: true },
      },
      select: { id: true },
    });

    if (!post) {
      throw new AppError("comment.errors.postNotFound", 404);
    }

    const rootWhere: Prisma.CommentWhereInput = {
      postId: post.id,
      status: "APPROVED",
      parentId: null,
    };

    const [rootComments, totalRootComments] = await Promise.all([
      prisma.comment.findMany({
        where: rootWhere,
        skip,
        take,
        include: commentBaseInclude,
        orderBy: { createdAt: "asc" },
      }),
      prisma.comment.count({ where: rootWhere }),
    ]);

    const flatComments = await fetchCommentDescendants(
      { postId: post.id },
      rootComments,
    );

    const tree = buildCommentTree(flatComments);

    const commentIds = flatComments.map((c) => c.id);
    const reactionMap = await getReactionCountsForList(
      "commentId",
      commentIds,
      userId,
    );

    const itemsWithReactions = addReactionsToTree(tree, reactionMap);

    return {
      items: itemsWithReactions,
      pagination: buildPaginationMeta(totalRootComments, page, limit),
    };
  },

  // [DB] Get current user's comments with pagination
  async getMyComments(userId: string, query: ListMyCommentsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.CommentWhereInput = { userId };

    if (query.status) {
      where.status = query.status as CommentStatus;
    }

    const [items, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: commentAdminInclude,
      }),
      prisma.comment.count({ where }),
    ]);

    return {
      items: formatAdminComments(items),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Admin get all comments with filters
  async getAdminComments(query: ListAdminCommentsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.CommentWhereInput = {};

    if (query.status) {
      where.status = query.status as CommentStatus;
    }

    if (query.search) {
      where.content = {
        contains: query.search,
        mode: "insensitive",
      };
    }

    const [items, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: commentAdminInclude,
      }),
      prisma.comment.count({ where }),
    ]);

    return {
      items: formatAdminComments(items),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Admin approve or reject comment
  async changeStatus(id: string, status: CommentStatus) {
    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      throw new AppError("comment.errors.notFound", 404);
    }

    if (comment.status === status) {
      const msgKey =
        status === "APPROVED"
          ? "comment.errors.alreadyApproved"
          : "comment.errors.alreadyRejected";

      throw new AppError(msgKey, 409);
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { status },
      include: commentAdminInclude,
    });

    return formatAdminComment(updated);
  },

  // [DB] Delete comment - admin or owner only
  async deleteComment(commentId: string, userId: string, isAdmin: boolean) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true },
    });

    if (!comment) {
      throw new AppError("comment.errors.notFound", 404);
    }

    // [AUTH] Block non-owner non-admin
    if (!isAdmin && comment.userId !== userId) {
      throw new AppError("comment.errors.forbiddenDelete", 403);
    }

    await prisma.comment.delete({ where: { id: commentId } });
  },
};
