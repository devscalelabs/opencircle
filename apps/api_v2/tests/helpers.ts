import bcryptjs from "bcryptjs";
import { signAccessToken } from "../src/utils/jwt";
import { prisma } from "../src/utils/prisma";

export async function createTestUser(overrides: Record<string, unknown> = {}) {
	const password = await bcryptjs.hash("password123", 10);
	const timestamp = Date.now();
	const randomSuffix = Math.random().toString(36).substring(2, 8);

	return prisma.user.create({
		data: {
			username: `testuser_${timestamp}_${randomSuffix}`,
			email: `test_${timestamp}_${randomSuffix}@example.com`,
			password,
			isActive: true,
			isVerified: true,
			role: "user" as const,
			settings: { create: {} },
			social: { create: {} },
			...overrides,
		},
	});
}

export async function createTestAdmin(overrides: Record<string, unknown> = {}) {
	return createTestUser({ role: "admin", ...overrides });
}

export function getAuthHeaders(user: { username: string }) {
	const token = signAccessToken(user.username);
	return { Authorization: `Bearer ${token}` };
}

export function jsonHeaders() {
	return { "Content-Type": "application/json" };
}

export async function cleanupTable(
	model: keyof typeof prisma,
	where: Record<string, unknown> = {},
) {
	const modelDelegate = prisma[model] as {
		deleteMany: (args: { where: Record<string, unknown> }) => Promise<unknown>;
	};
	await modelDelegate.deleteMany({ where });
}

export async function cleanupAll() {
	const tablenames = await prisma.$queryRaw<
		Array<{ tablename: string }>
	>`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

	const tables = tablenames
		.map(({ tablename }) => tablename)
		.filter(
			(name) => name !== "_prisma_migrations" && !name.startsWith("_"),
		);

	for (const table of tables) {
		await prisma.$executeRawUnsafe(
			`TRUNCATE TABLE "public"."${table}" CASCADE;`,
		);
	}
}

export async function seedAppSettings() {
	return prisma.appSettings.upsert({
		where: { id: "singleton" },
		update: {},
		create: {
			id: "singleton",
			appName: "OpenCircle",
			enableSignUp: true,
			enableOpencircleBranding: true,
		},
	});
}