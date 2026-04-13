import { createMiddleware } from "hono/factory";
import type { Context } from "../types";
import { ForbiddenError } from "../exceptions";

export const adminMiddleware = createMiddleware<{
	Variables: Context["Variables"];
}>(async (c, next) => {
	const user = c.get("user");
	if (!user || user.role !== "admin") {
		throw new ForbiddenError("Admin access required");
	}
	await next();
});
