import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import { authMiddleware, optionalAuthMiddleware } from "../../middleware/auth";
import {
	channelCreateSchema,
	channelUpdateSchema,
	listChannelsQuerySchema,
} from "./schema";
import {
	createChannel,
	getChannel,
	listChannels,
	updateChannel,
	deleteChannel,
} from "./service";

export const channelsRouter = new Hono<Context>()
	.post(
		"/channels",
		authMiddleware,
		zValidator("json", channelCreateSchema),
		async (c) => {
			const user = c.get("user") as NonNullable<Context["Variables"]["user"]>;
			const data = c.req.valid("json");
			const channel = await createChannel(data, user.id);
			return c.json({ data: channel }, 201);
		},
	)
	.get("/channels/:id", optionalAuthMiddleware, async (c) => {
		const id = c.req.param("id");
		const user = c.get("user");
		const channel = await getChannel(id, user?.id);
		return c.json({ data: channel });
	})
	.get(
		"/channels",
		optionalAuthMiddleware,
		zValidator("query", listChannelsQuerySchema),
		async (c) => {
			const query = c.req.valid("query");
			const user = c.get("user");
			const result = await listChannels(query, user?.id);
			return c.json({ data: result.data, meta: result.meta });
		},
	)
	.put(
		"/channels/:id",
		authMiddleware,
		zValidator("json", channelUpdateSchema),
		async (c) => {
			const user = c.get("user") as NonNullable<Context["Variables"]["user"]>;
			const id = c.req.param("id");
			const data = c.req.valid("json");
			const channel = await updateChannel(id, data, user.id);
			return c.json({ data: channel });
		},
	)
	.delete("/channels/:id", authMiddleware, async (c) => {
		const user = c.get("user") as NonNullable<Context["Variables"]["user"]>;
		const id = c.req.param("id");
		const result = await deleteChannel(id, user.id);
		return c.json({ data: result });
	});
