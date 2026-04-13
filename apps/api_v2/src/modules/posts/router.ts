import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import { authMiddleware, optionalAuthMiddleware } from "../../middleware/auth";
import {
	postCreateSchema,
	postUpdateSchema,
	listPostsQuerySchema,
	postWithFilesSchema,
} from "./schema";
import {
	createPost,
	createPostWithFiles,
	getPost,
	listPosts,
	updatePost,
	deletePost,
} from "./service";

export const postsRouter = new Hono<Context>();

postsRouter.post(
	"/posts",
	authMiddleware,
	zValidator("json", postCreateSchema),
	async (c) => {
		const user = c.get("user") as NonNullable<Context["Variables"]["user"]>;
		const data = c.req.valid("json");
		const post = await createPost(data, user.id);
		return c.json({ data: post }, 201);
	},
);

postsRouter.post("/posts/with-files", authMiddleware, async (c) => {
	const user = c.get("user") as NonNullable<Context["Variables"]["user"]>;
	const body = await c.req.parseBody();
	const jsonData = typeof body.json === "string" ? JSON.parse(body.json) : {};
	const parsed = postWithFilesSchema.parse(jsonData);

	const fileEntries = Object.entries(body).filter(([key]) =>
		key.startsWith("files"),
	);
	const files: { name: string; type: string; data: Buffer }[] = [];

	for (const [, value] of fileEntries) {
		if (value instanceof File) {
			const arrayBuffer = await value.arrayBuffer();
			files.push({
				name: value.name,
				type: value.type,
				data: Buffer.from(arrayBuffer),
			});
		}
	}

	const post = await createPostWithFiles(parsed, files, user.id);
	return c.json({ data: post }, 201);
});

postsRouter.get("/posts/:id", optionalAuthMiddleware, async (c) => {
	const id = c.req.param("id");
	const user = c.get("user");
	const post = await getPost(id, user?.id);
	return c.json({ data: post });
});

postsRouter.get(
	"/posts",
	optionalAuthMiddleware,
	zValidator("query", listPostsQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const user = c.get("user");
		const result = await listPosts(query, user?.id);
		return c.json({ data: result.data, meta: result.meta });
	},
);

postsRouter.put(
	"/posts/:id",
	authMiddleware,
	zValidator("json", postUpdateSchema),
	async (c) => {
		const user = c.get("user") as NonNullable<Context["Variables"]["user"]>;
		const id = c.req.param("id");
		const data = c.req.valid("json");
		const post = await updatePost(id, data, user.id);
		return c.json({ data: post });
	},
);

postsRouter.delete("/posts/:id", optionalAuthMiddleware, async (c) => {
	const id = c.req.param("id");
	const user = c.get("user");
	const result = await deletePost(id, user?.id);
	return c.json({ data: result });
});
