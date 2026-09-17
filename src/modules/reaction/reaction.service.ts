import {
  ReactionTarget,
  ReactionType,
} from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { getReactionCounts } from "../../utils/reactionHelper.js";
import { ToggleResult } from "./reaction.validator.js";

// [CONST] Map target type to prisma field name
const targetFieldMap: Record<
  ReactionTarget,
  "courseId" | "commentId" | "postId"
> = {
  COURSE: "courseId",
  COMMENT: "commentId",
  POST: "postId",
};

// [UTIL] Build reaction result translation key
const getMessageKey = (
  previousType: "LIKE" | "DISLIKE" | null,
  currentType: "LIKE" | "DISLIKE" | null,
): string => {
  if (!previousType && currentType === "LIKE") return "reaction.success.liked";
  if (!previousType && currentType === "DISLIKE")
    return "reaction.success.disliked";
  if (previousType === "LIKE" && !currentType)
    return "reaction.success.likeRemoved";
  if (previousType === "DISLIKE" && !currentType)
    return "reaction.success.dislikeRemoved";
  if (previousType === "LIKE" && currentType === "DISLIKE")
    return "reaction.success.toggledToDislike";
  if (previousType === "DISLIKE" && currentType === "LIKE")
    return "reaction.success.toggledToLike";
  return "reaction.success.default";
};

export const reactionService = {
  // [DB] Toggle like/dislike on course, post or comment
  async toggle(
    userId: string,
    targetType: ReactionTarget,
    targetId: string,
    type: ReactionType,
  ): Promise<ToggleResult> {
    const field = targetFieldMap[targetType];

    // [DB] Validate course exists and is published
    if (targetType === "COURSE") {
      const course = await prisma.course.findFirst({
        where: { id: targetId, published: true, category: { show: true } },
        select: { id: true },
      });

      if (!course) {
        throw new AppError("reaction.errors.courseNotFound", 404);
      }
    }

    // [DB] Validate post exists and is published
    if (targetType === "POST") {
      const post = await prisma.post.findFirst({
        where: { id: targetId, published: true, category: { show: true } },
        select: { id: true },
      });

      if (!post) {
        throw new AppError("reaction.errors.postNotFound", 404);
      }
    }

    // [DB] Validate comment exists and is approved
    if (targetType === "COMMENT") {
      const comment = await prisma.comment.findFirst({
        where: { id: targetId, status: "APPROVED" },
        select: { id: true },
      });

      if (!comment) {
        throw new AppError("reaction.errors.commentNotFound", 404);
      }
    }

    const existing = await prisma.reaction.findFirst({
      where: { userId, [field]: targetId },
    });

    let myReaction: "LIKE" | "DISLIKE" | null;

    if (!existing) {
      // [DB] Create new reaction
      await prisma.reaction.create({
        data: { type, targetType, userId, [field]: targetId },
      });
      myReaction = type;
    } else if (existing.type === type) {
      // [DB] Remove reaction if same type (toggle off)
      await prisma.reaction.delete({ where: { id: existing.id } });
      myReaction = null;
    } else {
      // [DB] Switch reaction type
      await prisma.reaction.update({
        where: { id: existing.id },
        data: { type },
      });
      myReaction = type;
    }

    const reactions = await getReactionCounts(field, targetId);
    const messageKey = getMessageKey(existing?.type ?? null, myReaction);

    return { message: messageKey, myReaction, reactions };
  },
};
