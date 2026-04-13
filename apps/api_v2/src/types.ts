import type { prisma } from "./utils/prisma";

export type Variables = {
	user: {
		id: string;
		username: string;
		email: string;
		role: "admin" | "user";
		isActive: boolean;
	} | null;
};

export type Context = {
	Bindings: {};
	Variables: Variables;
};

export type AuthedContext = {
	Bindings: {};
	Variables: {
		user: NonNullable<Variables["user"]>;
	};
};

export type PrismaClient = typeof prisma;
