import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import { authMiddleware, optionalAuthMiddleware } from "../../middleware/auth";
import {
	resourceCreateSchema,
	resourceUpdateSchema,
	listResourcesQuerySchema,
} from "./schema";
import {
	createResource,
	getResource,
	listResources,
	updateResource,
	deleteResource,
} from "./service";

export const resourcesRouter = new Hono<Context>()
	.post(
		"/resources",
		authMiddleware,
		zValidator("json", resourceCreateSchema),
		async (c) => {
			const user = c.get("user")!;
			const data = c.req.valid("json");
			const result = await createResource(data, user.id);
			return c.json({ data: result }, 201);
		},
	)
	.get("/resources/:id", optionalAuthMiddleware, async (c) => {
		const id = c.req.param("id");
		const user = c.get("user")!;
		const result = await getResource(id, user?.id);
		return c.json({ data: result });
	})
	.get(
		"/resources",
		optionalAuthMiddleware,
		zValidator("query", listResourcesQuerySchema),
		async (c) => {
			const user = c.get("user")!;
			const query = c.req.valid("query");
			const result = await listResources(query, user?.id);
			return c.json({
				data: result.items,
				meta: {
					page: result.page,
					limit: result.limit,
					total: result.total,
					has_more: result.page * result.limit < result.total,
				},
			});
		},
	)
	.put(
		"/resources/:id",
		authMiddleware,
		zValidator("json", resourceUpdateSchema),
		async (c) => {
			const user = c.get("user")!;
			const id = c.req.param("id");
			const data = c.req.valid("json");
			const result = await updateResource(id, data, user.id);
			return c.json({ data: result });
		},
	)
	.delete("/resources/:id", authMiddleware, async (c) => {
		const user = c.get("user")!;
		const id = c.req.param("id");
		const result = await deleteResource(id, user.id);
		return c.json({ data: result });
	});
