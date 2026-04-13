import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import { authMiddleware } from "../../middleware/auth";
import { adminMiddleware } from "../../middleware/admin";
import {
	appLinkCreateSchema,
	appLinkUpdateSchema,
	listAppLinksQuerySchema,
} from "./schema";
import {
	createAppLink,
	listAppLinks,
	getAppLink,
	updateAppLink,
	deleteAppLink,
} from "./service";

export const applinksRouter = new Hono<Context>();

applinksRouter.post(
	"/applinks",
	authMiddleware,
	adminMiddleware,
	zValidator("json", appLinkCreateSchema),
	async (c) => {
		const data = c.req.valid("json");
		const result = await createAppLink(data);
		return c.json({ data: result }, 201);
	},
);

applinksRouter.get(
	"/applinks",
	zValidator("query", listAppLinksQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const result = await listAppLinks(query);
		return c.json({ data: result });
	},
);

applinksRouter.get("/applinks/:id", async (c) => {
	const id = c.req.param("id");
	const result = await getAppLink(id);
	return c.json({ data: result });
});

applinksRouter.put(
	"/applinks/:id",
	authMiddleware,
	adminMiddleware,
	zValidator("json", appLinkUpdateSchema),
	async (c) => {
		const id = c.req.param("id");
		const data = c.req.valid("json");
		const result = await updateAppLink(id, data);
		return c.json({ data: result });
	},
);

applinksRouter.delete(
	"/applinks/:id",
	authMiddleware,
	adminMiddleware,
	async (c) => {
		const id = c.req.param("id");
		const result = await deleteAppLink(id);
		return c.json({ data: result });
	},
);
