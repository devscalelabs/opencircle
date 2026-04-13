import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import { authMiddleware } from "../../middleware/auth";
import { reactionCreateSchema, deleteReactionQuerySchema } from "./schema";
import { toggleReaction, getReactionsByPost, deleteReaction } from "./service";

export const reactionsRouter = new Hono<Context>();

reactionsRouter.post(
	"/reactions",
	authMiddleware,
	zValidator("json", reactionCreateSchema),
	async (c) => {
		const user = c.get("user")!;
		const data = c.req.valid("json");
		const result = await toggleReaction(user.id, data);
		return c.json({ data: result });
	},
);

reactionsRouter.get("/reactions/:postId", async (c) => {
	const postId = c.req.param("postId");
	const result = await getReactionsByPost(postId);
	return c.json({ data: result });
});

reactionsRouter.delete(
	"/reactions",
	authMiddleware,
	zValidator("query", deleteReactionQuerySchema),
	async (c) => {
		const user = c.get("user")!;
		const query = c.req.valid("query");
		const result = await deleteReaction(user.id, query);
		return c.json({ data: result });
	},
);
