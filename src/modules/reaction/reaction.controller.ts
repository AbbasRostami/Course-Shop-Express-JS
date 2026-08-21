import { RequestHandler } from "express";
import {
  ReactionTarget,
  ReactionType,
} from "../../../generated/prisma/client.js";
import { reactionService } from "./reaction.service.js";
import { ToggleReactionBody } from "./reaction.validator.js";

// [UTIL] Factory to create reaction controller for any target type
const createToggleController = (targetType: ReactionTarget): RequestHandler => {
  return async (req, res) => {
    const userId = req.user!.id;
    const targetId = req.params.id as string;
    const { type } = req.body as ToggleReactionBody;

    const result = await reactionService.toggle(
      userId,
      targetType,
      targetId,
      type as ReactionType,
    );

    return res.status(200).json({
      status: "success",
      data: result,
    });
  };
};

// [POST] Toggle course reaction
export const toggleCourseReaction = createToggleController("COURSE");

// [POST] Toggle post reaction
export const togglePostReaction = createToggleController("POST");

// [POST] Toggle comment reaction
export const toggleCommentReaction = createToggleController("COMMENT");