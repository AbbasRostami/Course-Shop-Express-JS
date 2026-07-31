import { prisma } from "../lib/prisma.js";

export interface ReactionCounts {
  likes: number;
  dislikes: number;
}

export interface ReactionState extends ReactionCounts {
  myReaction: "LIKE" | "DISLIKE" | null;
}

// [DB] Get like/dislike counts for single target
export const getReactionCounts = async (
  field: "courseId" | "commentId" | "postId",
  targetId: string,
): Promise<ReactionCounts> => {
  const [likes, dislikes] = await Promise.all([
    prisma.reaction.count({
      where: { [field]: targetId, type: "LIKE" },
    }),
    prisma.reaction.count({
      where: { [field]: targetId, type: "DISLIKE" },
    }),
  ]);

  return { likes, dislikes };
};

// [DB] Get current user's reaction for single target
export const getMyReaction = async (
  field: "courseId" | "commentId" | "postId",
  targetId: string,
  userId?: string,
): Promise<"LIKE" | "DISLIKE" | null> => {
  if (!userId) return null;

  const reaction = await prisma.reaction.findFirst({
    where: { [field]: targetId, userId },
    select: { type: true },
  });

  return (reaction?.type as "LIKE" | "DISLIKE") ?? null;
};

// [DB] Get reaction counts + user reaction for a list
export const getReactionCountsForList = async (
  field: "courseId" | "commentId" | "postId",
  targetIds: string[],
  userId?: string,
): Promise<Map<string, ReactionState>> => {
  if (targetIds.length === 0) {
    return new Map();
  }

  // [DB] Group counts by target and type
  const counts = await prisma.reaction.groupBy({
    by: [field, "type"],
    where: { [field]: { in: targetIds } },
    _count: true,
  });

  const userReactionMap = new Map<string, "LIKE" | "DISLIKE">();

  // [DB] Load user reactions if authenticated
  if (userId) {
    const userReactions = await prisma.reaction.findMany({
      where: {
        [field]: { in: targetIds },
        userId,
      },
      select: {
        [field]: true,
        type: true,
      },
    });

    for (const reaction of userReactions) {
      const id = reaction[field] as string | null;
      if (id) {
        userReactionMap.set(id, reaction.type as "LIKE" | "DISLIKE");
      }
    }
  }

  // [LOGIC] Build result map with defaults
  const resultMap = new Map<string, ReactionState>();

  for (const id of targetIds) {
    resultMap.set(id, {
      likes: 0,
      dislikes: 0,
      myReaction: userReactionMap.get(id) ?? null,
    });
  }

  // [LOGIC] Fill counts
  for (const row of counts) {
    const id = row[field] as string | null;
    if (!id) continue;

    const entry = resultMap.get(id);
    if (!entry) continue;

    if (row.type === "LIKE") {
      entry.likes = row._count;
    } else {
      entry.dislikes = row._count;
    }
  }

  return resultMap;
};