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

describe("Notification Preferences", () => {
	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	describe("GET /api/notification-preferences", () => {
		it("should create default preferences if none exist", async () => {
			const user = await createTestUser();
			const res = await app.request("/api/notification-preferences", {
				headers: getAuthHeaders(user),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(data.data.userId).toBe(user.id);
			expect(data.data.mentionEmail).toBe("immediate");
			expect(data.data.likeEmail).toBe("daily");
			expect(data.data.replyEmail).toBe("immediate");
		});

		it("should return existing preferences", async () => {
			const user = await createTestUser();
			await prisma.notificationPreferences.create({
				data: {
					userId: user.id,
					mentionEmail: "weekly",
					likeEmail: "none",
					replyEmail: "daily",
				},
			});

			const res = await app.request("/api/notification-preferences", {
				headers: getAuthHeaders(user),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.mentionEmail).toBe("weekly");
			expect(data.data.likeEmail).toBe("none");
			expect(data.data.replyEmail).toBe("daily");
		});

		it("should return 401 without auth", async () => {
			const res = await app.request("/api/notification-preferences");
			expect(res.status).toBe(401);
		});
	});

	describe("PUT /api/notification-preferences", () => {
		it("should update existing preferences", async () => {
			const user = await createTestUser();
			await app.request("/api/notification-preferences", {
				headers: getAuthHeaders(user),
			});

			const res = await app.request("/api/notification-preferences", {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					mentionEmail: "weekly",
					likeEmail: "none",
				}),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.mentionEmail).toBe("weekly");
			expect(data.data.likeEmail).toBe("none");
			expect(data.data.replyEmail).toBe("immediate");
		});

		it("should create preferences if none exist", async () => {
			const user = await createTestUser();
			const res = await app.request("/api/notification-preferences", {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					mentionEmail: "daily",
				}),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.mentionEmail).toBe("daily");
		});

		it("should return 401 without auth", async () => {
			const res = await app.request("/api/notification-preferences", {
				method: "PUT",
				headers: jsonHeaders(),
				body: JSON.stringify({ mentionEmail: "daily" }),
			});
			expect(res.status).toBe(401);
		});
	});
});
