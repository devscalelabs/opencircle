import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import { authMiddleware } from "../../middleware/auth";
import {
	articleCreateSchema,
	articleUpdateSchema,
	listArticlesQuerySchema,
} from "./schema";
import {
	createArticle,
	getArticle,
	listArticles,
	updateArticle,
	deleteArticle,
} from "./service";

export const articlesRouter = new Hono<Context>();

articlesRouter.post(
	"/articles",
	authMiddleware,
	zValidator("json", articleCreateSchema),
	async (c) => {
		const user = c.get("user")!;
		const data = c.req.valid("json");
		const result = await createArticle(user.id, data);
		return c.json({ data: result }, 201);
	},
);

articlesRouter.get("/articles/:id", async (c) => {
	const id = c.req.param("id");
	const result = await getArticle(id);
	return c.json({ data: result });
});

articlesRouter.get(
	"/articles",
	zValidator("query", listArticlesQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const result = await listArticles(query);
		return c.json({ data: result });
	},
);

articlesRouter.put(
	"/articles/:id",
	authMiddleware,
	zValidator("json", articleUpdateSchema),
	async (c) => {
		const user = c.get("user")!;
		const id = c.req.param("id");
		const data = c.req.valid("json");
		const result = await updateArticle(id, user.id, user.role, data);
		return c.json({ data: result });
	},
);

articlesRouter.delete("/articles/:id", authMiddleware, async (c) => {
	const user = c.get("user")!;
	const id = c.req.param("id");
	const result = await deleteArticle(id, user.id, user.role);
	return c.json({ data: result });
});
