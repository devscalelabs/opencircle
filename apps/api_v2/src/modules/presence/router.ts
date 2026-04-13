import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import { authMiddleware } from "../../middleware/auth";
import { adminMiddleware } from "../../middleware/admin";
import { timeseriesQuerySchema, presenceUserQuerySchema } from "./schema";
import {
	getStats,
	getUserPresence,
	getTimeseries,
	cleanup,
	getActiveNow,
} from "./service";

export const presenceRouter = new Hono<Context>()
	.get("/presence-stats", async (c) => {
		const result = await getStats();
		return c.json({ data: result });
	})
	.get("/presence", zValidator("query", presenceUserQuerySchema), async (c) => {
		const query = c.req.valid("query");
		if (query.user_id) {
			const result = await getUserPresence(query.user_id, query.limit ?? 100);
			return c.json({ data: result });
		}
		const result = await getStats();
		return c.json({ data: result });
	})
	.get(
		"/presence-timeseries",
		zValidator("query", timeseriesQuerySchema),
		async (c) => {
			const query = c.req.valid("query");
			const result = await getTimeseries(query);
			return c.json({ data: result });
		},
	)
	.post("/presence-cleanup", authMiddleware, adminMiddleware, async (c) => {
		const result = await cleanup();
		return c.json({ data: result });
	})
	.get("/presence-active", async (c) => {
		const result = await getActiveNow();
		return c.json({ data: result });
	});
