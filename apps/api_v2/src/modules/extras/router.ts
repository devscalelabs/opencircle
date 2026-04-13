import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import { urlPreviewQuerySchema } from "./schema";
import { getUrlPreview } from "./service";

export const extrasRouter = new Hono<Context>();

extrasRouter.get(
	"/url-preview",
	zValidator("query", urlPreviewQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const result = await getUrlPreview(query);
		return c.json({ data: result });
	},
);
