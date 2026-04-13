import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { app } from "../../src/app";
import { prisma } from "../../src/utils/prisma";
import {
	createTestUser,
	createTestAdmin,
	getAuthHeaders,
	jsonHeaders,
	cleanupAll,
	seedAppSettings,
} from "../helpers";

describe("Presence", () => {
	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	describe("GET /api/presence-stats", () => {
		it("should return presence stats", async () => {
			const res = await app.request("/api/presence-stats");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(data.data.totalSessions).toBeDefined();
			expect(data.data.activeSessions).toBeDefined();
			expect(data.data.averageDurationSeconds).toBeDefined();
			expect(data.data.uniqueUsers).toBeDefined();
		});

		it("should return correct counts with presence data", async () => {
			const user = await createTestUser();
			await prisma.userPresence.create({
				data: {
					userId: user.id,
					connectionId: "conn-1",
					connectedAt: new Date(),
				},
			});

			const res = await app.request("/api/presence-stats");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.totalSessions).toBeGreaterThanOrEqual(1);
			expect(data.data.uniqueUsers).toBeGreaterThanOrEqual(1);
		});
	});

	describe("GET /api/presence", () => {
		it("should return user presence when user_id is provided", async () => {
			const user = await createTestUser();
			await prisma.userPresence.create({
				data: {
					userId: user.id,
					connectionId: "conn-2",
					connectedAt: new Date(),
				},
			});
			await prisma.userPresence.create({
				data: {
					userId: user.id,
					connectionId: "conn-3",
					connectedAt: new Date(),
					disconnectedAt: new Date(),
					durationSeconds: 300,
				},
			});

			const res = await app.request(`/api/presence?user_id=${user.id}`);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.userId).toBe(user.id);
			expect(data.data.sessions).toBeDefined();
			expect(data.data.totalSessions).toBe(2);
		});

		it("should return stats when no user_id is provided", async () => {
			const res = await app.request("/api/presence");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.totalSessions).toBeDefined();
			expect(data.data.activeSessions).toBeDefined();
		});
	});

	describe("GET /api/presence-timeseries", () => {
		it("should return timeseries data with default interval", async () => {
			const res = await app.request("/api/presence-timeseries");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.interval).toBe("hour");
			expect(data.data.data).toBeDefined();
		});

		it("should return timeseries data with day interval", async () => {
			const res = await app.request("/api/presence-timeseries?interval=day");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.interval).toBe("day");
		});

		it("should return timeseries data with from and to parameters", async () => {
			const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
			const to = new Date().toISOString();
			const res = await app.request(
				`/api/presence-timeseries?interval=hour&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
			);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.from).toBe(from);
			expect(data.data.to).toBe(to);
		});

		it("should include presence data in timeseries", async () => {
			const user = await createTestUser();
			await prisma.userPresence.create({
				data: {
					userId: user.id,
					connectionId: "conn-ts-1",
					connectedAt: new Date(),
					durationSeconds: 120,
				},
			});

			const res = await app.request("/api/presence-timeseries?interval=hour");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.data.length).toBeGreaterThanOrEqual(1);
		});
	});

	describe("POST /api/presence-cleanup", () => {
		it("should return 403 for non-admin", async () => {
			const user = await createTestUser();
			const res = await app.request("/api/presence-cleanup", {
				method: "POST",
				headers: getAuthHeaders(user),
			});
			expect(res.status).toBe(403);
		});

		it("should return 401 without auth", async () => {
			const res = await app.request("/api/presence-cleanup", {
				method: "POST",
			});
			expect(res.status).toBe(401);
		});

		it("should clean up stale presence records as admin", async () => {
			const admin = await createTestAdmin();
			const user = await createTestUser();
			const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
			await prisma.userPresence.create({
				data: {
					userId: user.id,
					connectionId: "conn-stale",
					connectedAt: twoHoursAgo,
					updatedAt: twoHoursAgo,
				},
			});

			const res = await app.request("/api/presence-cleanup", {
				method: "POST",
				headers: getAuthHeaders(admin),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.cleanedUp).toBeDefined();
			expect(data.data.message).toBeDefined();
		});
	});

	describe("GET /api/presence-active", () => {
		it("should return active presence data", async () => {
			const res = await app.request("/api/presence-active");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(data.data.activeCount).toBeDefined();
			expect(data.data.activeUsers).toBeDefined();
		});

		it("should include active users in the last 30 minutes", async () => {
			const user = await createTestUser();
			await prisma.userPresence.create({
				data: {
					userId: user.id,
					connectionId: "conn-active",
					connectedAt: new Date(),
				},
			});

			const res = await app.request("/api/presence-active");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.activeCount).toBeGreaterThanOrEqual(1);
			expect(data.data.activeUsers.length).toBeGreaterThanOrEqual(1);
		});
	});
});
