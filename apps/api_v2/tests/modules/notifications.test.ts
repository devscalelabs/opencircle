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

describe("Notifications", () => {
	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	describe("GET /api/notifications", () => {
		it("should return empty list when no notifications exist", async () => {
			const user = await createTestUser();
			const res = await app.request("/api/notifications", {
				headers: getAuthHeaders(user),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.items).toBeDefined();
			expect(data.data.items.length).toBe(0);
			expect(data.data.total).toBe(0);
		});

		it("should list notifications for the authenticated user", async () => {
			const sender = await createTestUser();
			const recipient = await createTestUser();
			await prisma.notification.create({
				data: {
					recipientId: recipient.id,
					senderId: sender.id,
					type: "mention",
					data: { message: "mentioned you" },
				},
			});
			await prisma.notification.create({
				data: {
					recipientId: recipient.id,
					senderId: sender.id,
					type: "like",
					data: { message: "liked your post" },
				},
			});

			const res = await app.request("/api/notifications", {
				headers: getAuthHeaders(recipient),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.items.length).toBe(2);
			expect(data.data.total).toBe(2);
		});

		it("should only return notifications for the authenticated user", async () => {
			const sender = await createTestUser();
			const user1 = await createTestUser();
			const user2 = await createTestUser();
			await prisma.notification.create({
				data: {
					recipientId: user1.id,
					senderId: sender.id,
					type: "mention",
					data: {},
				},
			});
			await prisma.notification.create({
				data: {
					recipientId: user2.id,
					senderId: sender.id,
					type: "like",
					data: {},
				},
			});

			const res = await app.request("/api/notifications", {
				headers: getAuthHeaders(user1),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.items.length).toBe(1);
		});

		it("should support pagination", async () => {
			const sender = await createTestUser();
			const recipient = await createTestUser();
			for (let i = 0; i < 5; i++) {
				await prisma.notification.create({
					data: {
						recipientId: recipient.id,
						senderId: sender.id,
						type: "mention",
						data: { index: i },
					},
				});
			}

			const res = await app.request("/api/notifications?page=1&limit=3", {
				headers: getAuthHeaders(recipient),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.items.length).toBe(3);
			expect(data.data.total).toBe(5);
			expect(data.data.page).toBe(1);
			expect(data.data.limit).toBe(3);
		});

		it("should return 401 without auth", async () => {
			const res = await app.request("/api/notifications");
			expect(res.status).toBe(401);
		});
	});

	describe("POST /api/notifications/:id/read", () => {
		it("should mark a notification as read", async () => {
			const sender = await createTestUser();
			const recipient = await createTestUser();
			const notification = await prisma.notification.create({
				data: {
					recipientId: recipient.id,
					senderId: sender.id,
					type: "mention",
					data: {},
				},
			});

			const res = await app.request(
				`/api/notifications/${notification.id}/read`,
				{
					method: "POST",
					headers: getAuthHeaders(recipient),
				},
			);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.isRead).toBe(true);
		});

		it("should return 404 for notification not owned by user", async () => {
			const sender = await createTestUser();
			const recipient = await createTestUser();
			const otherUser = await createTestUser();
			const notification = await prisma.notification.create({
				data: {
					recipientId: recipient.id,
					senderId: sender.id,
					type: "mention",
					data: {},
				},
			});

			const res = await app.request(
				`/api/notifications/${notification.id}/read`,
				{
					method: "POST",
					headers: getAuthHeaders(otherUser),
				},
			);
			expect(res.status).toBe(404);
		});

		it("should return 404 for non-existent notification", async () => {
			const user = await createTestUser();
			const res = await app.request(
				"/api/notifications/00000000-0000-0000-0000-000000000000/read",
				{
					method: "POST",
					headers: getAuthHeaders(user),
				},
			);
			expect(res.status).toBe(404);
		});

		it("should return 401 without auth", async () => {
			const res = await app.request(
				"/api/notifications/00000000-0000-0000-0000-000000000000/read",
				{
					method: "POST",
				},
			);
			expect(res.status).toBe(401);
		});
	});
});
