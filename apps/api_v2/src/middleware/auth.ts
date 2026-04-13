import { createMiddleware } from "hono/factory";
import type { Context } from "../types";
import { verifyAccessToken } from "../utils/jwt";
import { prisma } from "../utils/prisma";
import { UnauthorizedError } from "../exceptions";

export const authMiddleware = createMiddleware<{
	Variables: Context["Variables"];
}>(async (c, next) => {
	const authHeader = c.req.header("Authorization");
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		throw new UnauthorizedError();
	}

	const token = authHeader.substring(7);
	const payload = verifyAccessToken(token);
	if (!payload || payload.type !== "access") {
		throw new UnauthorizedError();
	}

	const user = await prisma.user.findUnique({
		where: { username: payload.sub },
		select: {
			id: true,
			username: true,
			email: true,
			role: true,
			isActive: true,
		},
	});

	if (!user || !user.isActive) {
		throw new UnauthorizedError();
	}

	c.set("user", user);
	await next();
});

export const optionalAuthMiddleware = createMiddleware<{
	Variables: Context["Variables"];
}>(async (c, next) => {
	const authHeader = c.req.header("Authorization");
	if (authHeader && authHeader.startsWith("Bearer ")) {
		const token = authHeader.substring(7);
		const payload = verifyAccessToken(token);
		if (payload && payload.type === "access") {
			const user = await prisma.user.findUnique({
				where: { username: payload.sub },
				select: {
					id: true,
					username: true,
					email: true,
					role: true,
					isActive: true,
				},
			});
			if (user && user.isActive) {
				c.set("user", user);
			}
		}
	}
	await next();
});
