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

// [UTIL] Build reaction result message
const getMessage = (
  previousType: "LIKE" | "DISLIKE" | null,
  currentType: "LIKE" | "DISLIKE" | null,
): string => {
  if (!previousType && currentType === "LIKE") return "لایک شما ثبت شد";
  if (!previousType && currentType === "DISLIKE") return "دیسلایک شما ثبت شد";
  if (previousType === "LIKE" && !currentType) return "لایک شما برداشته شد";
  if (previousType === "DISLIKE" && !currentType) return "دیسلایک شما برداشته شد";
  if (previousType === "LIKE" && currentType === "DISLIKE") return "واکنش شما از لایک به دیسلایک تغییر کرد";
  if (previousType === "DISLIKE" && currentType === "LIKE") return "واکنش شما از دیسلایک به لایک تغییر کرد";
  return "واکنش شما با موفقیت ثبت شد";
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
        throw new AppError("دوره مورد نظر یافت نشد", 404);
      }
    }

    // [DB] Validate post exists and is published
    if (targetType === "POST") {
      const post = await prisma.post.findFirst({
        where: { id: targetId, published: true, category: { show: true } },
        select: { id: true },
      });

      if (!post) {
        throw new AppError("پست مورد نظر یافت نشد", 404);
      }
    }

    // [DB] Validate comment exists and is approved
    if (targetType === "COMMENT") {
      const comment = await prisma.comment.findFirst({
        where: { id: targetId, status: "APPROVED" },
        select: { id: true },
      });

      if (!comment) {
        throw new AppError("کامنت مورد نظر یافت نشد", 404);
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
    const message = getMessage(existing?.type ?? null, myReaction);

    return { message, myReaction, reactions };
  },
};