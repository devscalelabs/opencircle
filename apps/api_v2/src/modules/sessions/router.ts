import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import { authMiddleware } from "../../middleware/auth";
import { sessionIdSchema } from "./schema";
import { getSessions, revokeSession } from "./service";

export const sessionsRouter = new Hono<Context>()
	.get("/sessions", authMiddleware, async (c) => {
		const user = c.get("user")!;
		const sessions = await getSessions(user.id);
		return c.json({ data: sessions });
	})
	.post(
		"/sessions/revoke",
		authMiddleware,
		zValidator("json", sessionIdSchema),
		async (c) => {
			const user = c.get("user")!;
			const { sessionId } = c.req.valid("json");
			const result = await revokeSession(sessionId, user.id);
			return c.json({ data: result });
		},
	);
