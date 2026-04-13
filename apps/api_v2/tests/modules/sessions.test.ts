import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { app } from "../../src/app";
import { prisma } from "../../src/utils/prisma";
import {
	createTestUser,
	getAuthHeaders,
	jsonHeaders,
	cleanupAll,
	seedAppSettings,
} from "../helpers";

describe("Sessions", () => {
	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	describe("GET /api/sessions", () => {
		it("should return sessions for authenticated user", async () => {
			const user = await createTestUser();
			await app.request("/api/login", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					username: user.username,
					password: "password123",
				}),
			});
			const res = await app.request("/api/sessions", {
				headers: getAuthHeaders(user),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(Array.isArray(data.data)).toBe(true);
		});

		it("should return empty sessions list for user with no sessions", async () => {
			const user = await createTestUser();
			const res = await app.request("/api/sessions", {
				headers: getAuthHeaders(user),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(Array.isArray(data.data)).toBe(true);
			expect(data.data.length).toBe(0);
		});

		it("should return 401 without authentication", async () => {
			const res = await app.request("/api/sessions");
			expect(res.status).toBe(401);
		});
	});

	describe("POST /api/sessions/revoke", () => {
		it("should revoke a session successfully", async () => {
			const user = await createTestUser();
			await app.request("/api/login", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					username: user.username,
					password: "password123",
				}),
			});
			const sessionsRes = await app.request("/api/sessions", {
				headers: getAuthHeaders(user),
			});
			const sessionsData = await sessionsRes.json();
			const sessionId = sessionsData.data[0].id;

			const res = await app.request("/api/sessions/revoke", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ sessionId }),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.success).toBe(true);
		});

		it("should return 404 for non-existent session", async () => {
			const user = await createTestUser();
			const fakeSessionId = "00000000-0000-0000-0000-000000000000";
			const res = await app.request("/api/sessions/revoke", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ sessionId: fakeSessionId }),
			});
			expect(res.status).toBe(404);
		});

		it("should return 401 without authentication", async () => {
			const res = await app.request("/api/sessions/revoke", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					sessionId: "00000000-0000-0000-0000-000000000000",
				}),
			});
			expect(res.status).toBe(401);
		});

		it("should not allow revoking another user session", async () => {
			const user1 = await createTestUser({ username: "user1_session" });
			const user2 = await createTestUser({ username: "user2_session" });
			await app.request("/api/login", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					username: "user1_session",
					password: "password123",
				}),
			});
			const sessionsRes = await app.request("/api/sessions", {
				headers: getAuthHeaders(user1),
			});
			const sessionsData = await sessionsRes.json();
			const sessionId = sessionsData.data[0].id;

			const res = await app.request("/api/sessions/revoke", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user2) },
				body: JSON.stringify({ sessionId }),
			});
			expect(res.status).toBe(404);
		});
	});
});
