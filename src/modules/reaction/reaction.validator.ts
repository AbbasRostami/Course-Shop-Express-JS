import { z } from "zod";
import { ReactionCounts } from "../../utils/reactionHelper";

// [VALID] Toggle reaction schema
export const toggleReactionSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
  body: z.object({
    type: z.enum(["LIKE", "DISLIKE"], {
      error: "type باید LIKE یا DISLIKE باشد",
    }),
  }),
});

export type ToggleReactionBody = z.infer<typeof toggleReactionSchema>["body"];

// [TYPE] Toggle reaction result
export interface ToggleResult {
  message: string;
  myReaction: "LIKE" | "DISLIKE" | null;
  reactions: ReactionCounts;
}