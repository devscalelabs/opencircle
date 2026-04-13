import { Hono } from "hono";
import type { Context } from "../../types";
import { authMiddleware } from "../../middleware/auth";
import { getAccount } from "./service";

export const accountRouter = new Hono<Context>().get(
	"/account",
	authMiddleware,
	async (c) => {
		const user = c.get("user")!;
		const account = await getAccount(user.id);
		return c.json({ data: account });
	},
);
