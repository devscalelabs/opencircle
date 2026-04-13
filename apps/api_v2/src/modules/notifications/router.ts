import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import { authMiddleware } from "../../middleware/auth";
import { listNotificationsQuerySchema } from "./schema";
import { listNotifications, markAsRead } from "./service";

export const notificationsRouter = new Hono<Context>()
	.get(
		"/notifications",
		authMiddleware,
		zValidator("query", listNotificationsQuerySchema),
		async (c) => {
			const user = c.get("user")!;
			const query = c.req.valid("query");
			const result = await listNotifications(user.id, query);
			return c.json({ data: result });
		},
	)
	.post("/notifications/:id/read", authMiddleware, async (c) => {
		const user = c.get("user")!;
		const id = c.req.param("id");
		const result = await markAsRead(id, user.id);
		return c.json({ data: result });
	});
