import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { app } from "../../src/app";
import {
	createTestUser,
	getAuthHeaders,
	jsonHeaders,
	cleanupAll,
	seedAppSettings,
} from "../helpers";

describe("Account", () => {
	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	it("should return account data for authenticated user", async () => {
		const user = await createTestUser();
		const res = await app.request("/api/account", {
			headers: getAuthHeaders(user),
		});
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.data).toBeDefined();
		expect(data.data.id).toBe(user.id);
		expect(data.data.username).toBe(user.username);
		expect(data.data.email).toBe(user.email);
		expect(data.data.password).toBeUndefined();
		expect(data.data.is_active).toBe(true);
	});

	it("should return 401 without authentication", async () => {
		const res = await app.request("/api/account");
		expect(res.status).toBe(401);
	});

	it("should return 401 with invalid token", async () => {
		const res = await app.request("/api/account", {
			headers: { Authorization: "Bearer invalid-token" },
		});
		expect(res.status).toBe(401);
	});
});
