import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import { authMiddleware } from "../../middleware/auth";
import { notificationPreferencesUpdateSchema } from "./schema";
import { getPreferences, updatePreferences } from "./service";

export const notificationPreferencesRouter = new Hono<Context>()
	.get("/notification-preferences", authMiddleware, async (c) => {
		const user = c.get("user")!;
		const result = await getPreferences(user.id);
		return c.json({ data: result });
	})
	.put(
		"/notification-preferences",
		authMiddleware,
		zValidator("json", notificationPreferencesUpdateSchema),
		async (c) => {
			const user = c.get("user")!;
			const data = c.req.valid("json");
			const result = await updatePreferences(user.id, data);
			return c.json({ data: result });
		},
	);
