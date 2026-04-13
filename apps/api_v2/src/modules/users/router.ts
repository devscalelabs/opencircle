import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import { authMiddleware, optionalAuthMiddleware } from "../../middleware/auth";
import { adminMiddleware } from "../../middleware/admin";
import {
	createUserSchema,
	updateUserSchema,
	listUsersQuerySchema,
} from "./schema";
import {
	createUser,
	getUser,
	listUsers,
	updateUser,
	deleteUser,
	banUser,
} from "./service";

export const usersRouter = new Hono<Context>()
	.post("/users", zValidator("json", createUserSchema), async (c) => {
		const body = c.req.valid("json");
		const user = await createUser(body);
		return c.json({ data: user }, 201);
	})
	.get("/users/:id", async (c) => {
		const id = c.req.param("id");
		const user = await getUser(id);
		return c.json({ data: user });
	})
	.get("/users", optionalAuthMiddleware, async (c) => {
		const query = listUsersQuerySchema.parse(c.req.query());
		const result = await listUsers(query);
		return c.json({ data: result });
	})
	.put(
		"/users/:id",
		authMiddleware,
		zValidator("json", updateUserSchema),
		async (c) => {
			const id = c.req.param("id");
			const body = c.req.valid("json");
			const user = await updateUser(id, body);
			return c.json({ data: user });
		},
	)
	.delete("/users/:id", authMiddleware, async (c) => {
		const id = c.req.param("id");
		const result = await deleteUser(id);
		return c.json({ data: result });
	})
	.post("/users/:id/ban", authMiddleware, adminMiddleware, async (c) => {
		const id = c.req.param("id");
		const user = await banUser(id);
		return c.json({ data: user });
	});
