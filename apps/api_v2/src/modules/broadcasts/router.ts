import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import { authMiddleware } from "../../middleware/auth";
import { adminMiddleware } from "../../middleware/admin";
import {
	broadcastCreateSchema,
	broadcastUpdateSchema,
	broadcastSendTestSchema,
	listBroadcastsQuerySchema,
} from "./schema";
import {
	createBroadcast,
	listBroadcasts,
	getBroadcast,
	updateBroadcast,
	deleteBroadcast,
	sendTestBroadcast,
	sendBroadcast,
} from "./service";

export const broadcastsRouter = new Hono<Context>();

broadcastsRouter.post(
	"/broadcasts",
	authMiddleware,
	adminMiddleware,
	zValidator("json", broadcastCreateSchema),
	async (c) => {
		const user = c.get("user")!;
		const data = c.req.valid("json");
		const result = await createBroadcast(data, user.id);
		return c.json({ data: result }, 201);
	},
);

broadcastsRouter.get(
	"/broadcasts",
	authMiddleware,
	adminMiddleware,
	zValidator("query", listBroadcastsQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const result = await listBroadcasts(query);
		return c.json({ data: result });
	},
);

broadcastsRouter.get(
	"/broadcasts/:id",
	authMiddleware,
	adminMiddleware,
	async (c) => {
		const id = c.req.param("id");
		const result = await getBroadcast(id);
		return c.json({ data: result });
	},
);

broadcastsRouter.put(
	"/broadcasts/:id",
	authMiddleware,
	adminMiddleware,
	zValidator("json", broadcastUpdateSchema),
	async (c) => {
		const id = c.req.param("id");
		const data = c.req.valid("json");
		const result = await updateBroadcast(id, data);
		return c.json({ data: result });
	},
);

broadcastsRouter.delete(
	"/broadcasts/:id",
	authMiddleware,
	adminMiddleware,
	async (c) => {
		const id = c.req.param("id");
		const result = await deleteBroadcast(id);
		return c.json({ data: result });
	},
);

broadcastsRouter.post(
	"/broadcasts/:id/send-test",
	authMiddleware,
	adminMiddleware,
	zValidator("json", broadcastSendTestSchema),
	async (c) => {
		const id = c.req.param("id");
		const { email } = c.req.valid("json");
		const result = await sendTestBroadcast(id, email);
		return c.json({ data: result });
	},
);

broadcastsRouter.post(
	"/broadcasts/:id/send",
	authMiddleware,
	adminMiddleware,
	async (c) => {
		const id = c.req.param("id");
		const result = await sendBroadcast(id);
		return c.json({ data: result });
	},
);
