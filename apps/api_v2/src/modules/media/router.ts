import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import { authMiddleware } from "../../middleware/auth";
import {
	mediaCreateSchema,
	mediaUpdateSchema,
	listMediasQuerySchema,
} from "./schema";
import {
	createMedia,
	getMedia,
	listMedia,
	updateMedia,
	deleteMedia,
} from "./service";

export const mediasRouter = new Hono<Context>();

mediasRouter.post(
	"/medias",
	authMiddleware,
	zValidator("json", mediaCreateSchema),
	async (c) => {
		const data = c.req.valid("json");
		const result = await createMedia(data);
		return c.json({ data: result }, 201);
	},
);

mediasRouter.get("/medias/:id", async (c) => {
	const id = c.req.param("id");
	const result = await getMedia(id);
	return c.json({ data: result });
});

mediasRouter.get(
	"/medias",
	zValidator("query", listMediasQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const result = await listMedia(query);
		return c.json({ data: result });
	},
);

mediasRouter.put(
	"/medias/:id",
	authMiddleware,
	zValidator("json", mediaUpdateSchema),
	async (c) => {
		const id = c.req.param("id");
		const data = c.req.valid("json");
		const result = await updateMedia(id, data);
		return c.json({ data: result });
	},
);

mediasRouter.delete("/medias/:id", authMiddleware, async (c) => {
	const id = c.req.param("id");
	const result = await deleteMedia(id);
	return c.json({ data: result });
});
