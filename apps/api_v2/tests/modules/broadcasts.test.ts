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

describe("Broadcasts", () => {
	let admin: Awaited<ReturnType<typeof createTestAdmin>>;
	let regularUser: Awaited<ReturnType<typeof createTestUser>>;

	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
		admin = await createTestAdmin();
		regularUser = await createTestUser();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	describe("POST /api/broadcasts", () => {
		it("should create a broadcast as admin", async () => {
			const res = await app.request("/api/broadcasts", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({
					subject: "Test Broadcast",
					content: "This is a test broadcast",
					recipientType: "all_users",
				}),
			});
			expect(res.status).toBe(201);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(data.data.subject).toBe("Test Broadcast");
			expect(data.data.content).toBe("This is a test broadcast");
			expect(data.data.recipientType).toBe("all_users");
			expect(data.data.status).toBe("draft");
			expect(data.data.createdBy).toBe(admin.id);
		});

		it("should create a broadcast for channel_members with channelId", async () => {
			const channel = await prisma.channel.create({
				data: {
					emoji: "📢",
					name: "Test Channel",
					slug: "test-channel-bc1",
					type: "public",
				},
			});
			const res = await app.request("/api/broadcasts", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({
					subject: "Channel Broadcast",
					content: "For channel members",
					recipientType: "channel_members",
					channelId: channel.id,
				}),
			});
			expect(res.status).toBe(201);
			const data = await res.json();
			expect(data.data.channelId).toBe(channel.id);
		});

		it("should return 400 when channelId is missing for channel_members type", async () => {
			const res = await app.request("/api/broadcasts", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({
					subject: "Bad Broadcast",
					content: "Missing channel",
					recipientType: "channel_members",
				}),
			});
			expect(res.status).toBe(400);
		});

		it("should return 403 for non-admin", async () => {
			const res = await app.request("/api/broadcasts", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(regularUser) },
				body: JSON.stringify({
					subject: "Test",
					content: "Test content",
					recipientType: "all_users",
				}),
			});
			expect(res.status).toBe(403);
		});

		it("should return 401 without auth", async () => {
			const res = await app.request("/api/broadcasts", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					subject: "Test",
					content: "Test",
					recipientType: "all_users",
				}),
			});
			expect(res.status).toBe(401);
		});
	});

	describe("GET /api/broadcasts", () => {
		it("should list broadcasts as admin", async () => {
			await app.request("/api/broadcasts", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({
					subject: "Broadcast 1",
					content: "Content 1",
					recipientType: "all_users",
				}),
			});

			const res = await app.request("/api/broadcasts", {
				headers: getAuthHeaders(admin),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.items.length).toBe(1);
			expect(data.data.total).toBe(1);
		});

		it("should return 403 for non-admin", async () => {
			const res = await app.request("/api/broadcasts", {
				headers: getAuthHeaders(regularUser),
			});
			expect(res.status).toBe(403);
		});

		it("should return 401 without auth", async () => {
			const res = await app.request("/api/broadcasts");
			expect(res.status).toBe(401);
		});
	});

	describe("GET /api/broadcasts/:id", () => {
		it("should get a broadcast by ID as admin", async () => {
			const createRes = await app.request("/api/broadcasts", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({
					subject: "Get Broadcast",
					content: "Content",
					recipientType: "all_users",
				}),
			});
			const createData = await createRes.json();
			const id = createRes.status === 201 ? createData.data.id : null;
			expect(id).not.toBeNull();

			const res = await app.request(`/api/broadcasts/${id}`, {
				headers: getAuthHeaders(admin),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.id).toBe(id);
			expect(data.data.creator).toBeDefined();
		});

		it("should return 404 for non-existent broadcast", async () => {
			const res = await app.request(
				"/api/broadcasts/00000000-0000-0000-0000-000000000000",
				{ headers: getAuthHeaders(admin) },
			);
			expect(res.status).toBe(404);
		});

		it("should return 403 for non-admin", async () => {
			const res = await app.request(
				"/api/broadcasts/00000000-0000-0000-0000-000000000000",
				{ headers: getAuthHeaders(regularUser) },
			);
			expect(res.status).toBe(403);
		});
	});

	describe("PUT /api/broadcasts/:id", () => {
		it("should update a draft broadcast", async () => {
			const createRes = await app.request("/api/broadcasts", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({
					subject: "Original",
					content: "Original content",
					recipientType: "all_users",
				}),
			});
			const createData = await createRes.json();
			const id = createData.data.id;

			const res = await app.request(`/api/broadcasts/${id}`, {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({ subject: "Updated" }),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.subject).toBe("Updated");
		});

		it("should return 400 when updating a non-draft broadcast", async () => {
			const createRes = await app.request("/api/broadcasts", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({
					subject: "Broadcast",
					content: "Content",
					recipientType: "all_users",
				}),
			});
			const createData = await createRes.json();
			const id = createData.data.id;

			await prisma.broadcast.update({
				where: { id },
				data: { status: "sending" },
			});

			const res = await app.request(`/api/broadcasts/${id}`, {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({ subject: "Try update" }),
			});
			expect(res.status).toBe(400);
		});

		it("should return 404 for non-existent broadcast", async () => {
			const res = await app.request(
				"/api/broadcasts/00000000-0000-0000-0000-000000000000",
				{
					method: "PUT",
					headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
					body: JSON.stringify({ subject: "Test" }),
				},
			);
			expect(res.status).toBe(404);
		});

		it("should return 403 for non-admin", async () => {
			const res = await app.request(
				"/api/broadcasts/00000000-0000-0000-0000-000000000000",
				{
					method: "PUT",
					headers: { ...jsonHeaders(), ...getAuthHeaders(regularUser) },
					body: JSON.stringify({ subject: "Test" }),
				},
			);
			expect(res.status).toBe(403);
		});
	});

	describe("DELETE /api/broadcasts/:id", () => {
		it("should soft-delete a broadcast", async () => {
			const createRes = await app.request("/api/broadcasts", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({
					subject: "To Delete",
					content: "Content",
					recipientType: "all_users",
				}),
			});
			const createData = await createRes.json();
			const id = createData.data.id;

			const res = await app.request(`/api/broadcasts/${id}`, {
				method: "DELETE",
				headers: getAuthHeaders(admin),
			});
			expect(res.status).toBe(200);

			const getRes = await app.request(`/api/broadcasts/${id}`, {
				headers: getAuthHeaders(admin),
			});
			expect(getRes.status).toBe(404);
		});

		it("should return 404 for non-existent broadcast", async () => {
			const res = await app.request(
				"/api/broadcasts/00000000-0000-0000-0000-000000000000",
				{
					method: "DELETE",
					headers: getAuthHeaders(admin),
				},
			);
			expect(res.status).toBe(404);
		});

		it("should return 403 for non-admin", async () => {
			const res = await app.request(
				"/api/broadcasts/00000000-0000-0000-0000-000000000000",
				{
					method: "DELETE",
					headers: getAuthHeaders(regularUser),
				},
			);
			expect(res.status).toBe(403);
		});
	});

	describe("POST /api/broadcasts/:id/send-test", () => {
		it("should return 404 for non-existent broadcast", async () => {
			const res = await app.request(
				"/api/broadcasts/00000000-0000-0000-0000-000000000000/send-test",
				{
					method: "POST",
					headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
					body: JSON.stringify({ email: "test@example.com" }),
				},
			);
			expect(res.status).toBe(404);
		});

		it("should return 403 for non-admin", async () => {
			const res = await app.request(
				"/api/broadcasts/00000000-0000-0000-0000-000000000000/send-test",
				{
					method: "POST",
					headers: { ...jsonHeaders(), ...getAuthHeaders(regularUser) },
					body: JSON.stringify({ email: "test@example.com" }),
				},
			);
			expect(res.status).toBe(403);
		});
	});

	describe("POST /api/broadcasts/:id/send", () => {
		it("should return 400 when sending a non-draft broadcast", async () => {
			const createRes = await app.request("/api/broadcasts", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({
					subject: "Test Send",
					content: "Content",
					recipientType: "test_email",
					testEmail: "test@example.com",
				}),
			});
			const createData = await createRes.json();
			const id = createData.data.id;

			await prisma.broadcast.update({
				where: { id },
				data: { status: "sent" },
			});

			const res = await app.request(`/api/broadcasts/${id}/send`, {
				method: "POST",
				headers: getAuthHeaders(admin),
			});
			expect(res.status).toBe(400);
		});

		it("should return 403 for non-admin", async () => {
			const res = await app.request(
				"/api/broadcasts/00000000-0000-0000-0000-000000000000/send",
				{
					method: "POST",
					headers: getAuthHeaders(regularUser),
				},
			);
			expect(res.status).toBe(403);
		});

		it("should return 401 without auth", async () => {
			const res = await app.request(
				"/api/broadcasts/00000000-0000-0000-0000-000000000000/send",
				{
					method: "POST",
				},
			);
			expect(res.status).toBe(401);
		});
	});
});
