import { z } from "zod";

export const reactionCreateSchema = z.object({
	postId: z.string().uuid(),
	emoji: z.string().min(1),
});

export const deleteReactionQuerySchema = z.object({
	postId: z.string().uuid(),
	emoji: z.string().min(1),
});

export type ReactionCreateInput = z.infer<typeof reactionCreateSchema>;
export type DeleteReactionQuery = z.infer<typeof deleteReactionQuerySchema>;
