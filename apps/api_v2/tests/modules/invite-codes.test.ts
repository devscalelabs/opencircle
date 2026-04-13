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

describe("Invite Codes", () => {
	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	describe("POST /api/invite-codes", () => {
		it("should create an invite code with auth", async () => {
			const user = await createTestUser();
			const res = await app.request("/api/invite-codes", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ maxUses: 5 }),
			});
			expect(res.status).toBe(201);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(data.data.code).toBeDefined();
			expect(data.data.maxUses).toBe(5);
			expect(data.data.usedCount).toBe(0);
			expect(data.data.status).toBe("active");
			expect(data.data.createdByUser).toBeDefined();
			expect(data.data.createdByUser.id).toBe(user.id);
		});

		it("should create an invite code with a custom code", async () => {
			const user = await createTestUser();
			const res = await app.request("/api/invite-codes", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ code: "CUSTOM123", maxUses: 1 }),
			});
			expect(res.status).toBe(201);
			const data = await res.json();
			expect(data.data.code).toBe("CUSTOM123");
		});

		it("should create an invite code with autoJoinChannelId", async () => {
			const user = await createTestUser();
			const channel = await prisma.channel.create({
				data: {
					emoji: "📢",
					name: "Test Channel",
					slug: "test-channel-ic1",
					type: "public",
				},
			});
			const res = await app.request("/api/invite-codes", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					maxUses: 10,
					autoJoinChannelId: channel.id,
				}),
			});
			expect(res.status).toBe(201);
			const data = await res.json();
			expect(data.data.autoJoinChannelId).toBe(channel.id);
		});

		it("should return 401 without auth", async () => {
			const res = await app.request("/api/invite-codes", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({ maxUses: 5 }),
			});
			expect(res.status).toBe(401);
		});

		it("should return 409 for duplicate code", async () => {
			const user = await createTestUser();
			await app.request("/api/invite-codes", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ code: "DUPLICATE", maxUses: 1 }),
			});
			const res = await app.request("/api/invite-codes", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ code: "DUPLICATE", maxUses: 1 }),
			});
			expect(res.status).toBe(409);
		});
	});

	describe("GET /api/invite-codes", () => {
		it("should list invite codes", async () => {
			const user = await createTestUser();
			await app.request("/api/invite-codes", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ maxUses: 1 }),
			});
			const res = await app.request("/api/invite-codes");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.items).toBeDefined();
			expect(data.data.items.length).toBe(1);
			expect(data.data.total).toBe(1);
		});

		it("should filter invite codes by status", async () => {
			const user = await createTestUser();
			await app.request("/api/invite-codes", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ maxUses: 1 }),
			});
			const res = await app.request("/api/invite-codes?status=active");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.items.length).toBe(1);
		});

		it("should filter invite codes by createdBy", async () => {
			const user = await createTestUser();
			await app.request("/api/invite-codes", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ maxUses: 1 }),
			});
			const res = await app.request(`/api/invite-codes?createdBy=${user.id}`);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.items.length).toBe(1);
		});
	});

	describe("GET /api/invite-codes/:id", () => {
		it("should get an invite code by ID", async () => {
			const user = await createTestUser();
			const createRes = await app.request("/api/invite-codes", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ maxUses: 1 }),
			});
			const createData = await createRes.json();
			const id = createData.data.id;

			const res = await app.request(`/api/invite-codes/${id}`);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.id).toBe(id);
			expect(data.data.createdByUser).toBeDefined();
		});

		it("should return 404 for non-existent invite code", async () => {
			const res = await app.request(
				"/api/invite-codes/00000000-0000-0000-0000-000000000000",
			);
			expect(res.status).toBe(404);
		});
	});

	describe("GET /api/invite-codes/channel/:channelId", () => {
		it("should get invite codes for a channel", async () => {
			const user = await createTestUser();
			const channel = await prisma.channel.create({
				data: {
					emoji: "📢",
					name: "Test Channel",
					slug: "test-channel-ic2",
					type: "public",
				},
			});
			await app.request("/api/invite-codes", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					maxUses: 10,
					autoJoinChannelId: channel.id,
				}),
			});

			const res = await app.request(`/api/invite-codes/channel/${channel.id}`);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.items.length).toBe(1);
		});
	});

	describe("PUT /api/invite-codes/:id", () => {
		it("should update an invite code", async () => {
			const user = await createTestUser();
			const createRes = await app.request("/api/invite-codes", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ maxUses: 1 }),
			});
			const createData = await createRes.json();
			const id = createData.data.id;

			const res = await app.request(`/api/invite-codes/${id}`, {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ maxUses: 10 }),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.maxUses).toBe(10);
		});

		it("should return 404 for updating non-existent invite code", async () => {
			const user = await createTestUser();
			const res = await app.request(
				"/api/invite-codes/00000000-0000-0000-0000-000000000000",
				{
					method: "PUT",
					headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
					body: JSON.stringify({ maxUses: 5 }),
				},
			);
			expect(res.status).toBe(404);
		});

		it("should return 401 without auth", async () => {
			const res = await app.request(
				"/api/invite-codes/00000000-0000-0000-0000-000000000000",
				{
					method: "PUT",
					headers: jsonHeaders(),
					body: JSON.stringify({ maxUses: 5 }),
				},
			);
			expect(res.status).toBe(401);
		});
	});

	describe("POST /api/invite-codes/:id/deactivate", () => {
		it("should deactivate an invite code", async () => {
			const user = await createTestUser();
			const createRes = await app.request("/api/invite-codes", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ maxUses: 1 }),
			});
			const createData = await createRes.json();
			const id = createData.data.id;

			const res = await app.request(`/api/invite-codes/${id}/deactivate`, {
				method: "POST",
				headers: { ...getAuthHeaders(user) },
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.status).toBe("expired");
		});

		it("should return 404 for deactivating non-existent invite code", async () => {
			const user = await createTestUser();
			const res = await app.request(
				"/api/invite-codes/00000000-0000-0000-0000-000000000000/deactivate",
				{
					method: "POST",
					headers: getAuthHeaders(user),
				},
			);
			expect(res.status).toBe(404);
		});

		it("should return 401 without auth", async () => {
			const res = await app.request(
				"/api/invite-codes/00000000-0000-0000-0000-000000000000/deactivate",
				{
					method: "POST",
				},
			);
			expect(res.status).toBe(401);
		});
	});

	describe("DELETE /api/invite-codes/:id", () => {
		it("should soft-delete an invite code", async () => {
			const user = await createTestUser();
			const createRes = await app.request("/api/invite-codes", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ maxUses: 1 }),
			});
			const createData = await createRes.json();
			const id = createData.data.id;

			const res = await app.request(`/api/invite-codes/${id}`, {
				method: "DELETE",
				headers: getAuthHeaders(user),
			});
			expect(res.status).toBe(200);

			const getRes = await app.request(`/api/invite-codes/${id}`);
			expect(getRes.status).toBe(404);
		});

		it("should return 404 for deleting non-existent invite code", async () => {
			const user = await createTestUser();
			const res = await app.request(
				"/api/invite-codes/00000000-0000-0000-0000-000000000000",
				{
					method: "DELETE",
					headers: getAuthHeaders(user),
				},
			);
			expect(res.status).toBe(404);
		});

		it("should return 401 without auth", async () => {
			const res = await app.request(
				"/api/invite-codes/00000000-0000-0000-0000-000000000000",
				{
					method: "DELETE",
				},
			);
			expect(res.status).toBe(401);
		});
	});

	describe("POST /api/invite-codes/validate", () => {
		it("should validate and use an invite code", async () => {
			const creator = await createTestUser();
			const user = await createTestUser();
			const createRes = await app.request("/api/invite-codes", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(creator) },
				body: JSON.stringify({ code: "VALID123", maxUses: 5 }),
			});
			const createData = await createRes.json();

			const res = await app.request("/api/invite-codes/validate", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ code: "VALID123" }),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.usedCount).toBe(1);
			expect(data.data.code).toBe("VALID123");
		});

		it("should return 400 for invalid invite code", async () => {
			const user = await createTestUser();
			const res = await app.request("/api/invite-codes/validate", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ code: "NONEXISTENT" }),
			});
			expect(res.status).toBe(400);
		});

		it("should return 400 for fully used invite code", async () => {
			const creator = await createTestUser();
			const user1 = await createTestUser();
			const user2 = await createTestUser();
			await app.request("/api/invite-codes", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(creator) },
				body: JSON.stringify({ code: "SINGLE", maxUses: 1 }),
			});

			await app.request("/api/invite-codes/validate", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user1) },
				body: JSON.stringify({ code: "SINGLE" }),
			});

			const res = await app.request("/api/invite-codes/validate", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user2) },
				body: JSON.stringify({ code: "SINGLE" }),
			});
			expect(res.status).toBe(400);
		});

		it("should auto-join a channel when validating code with autoJoinChannelId", async () => {
			const creator = await createTestUser();
			const user = await createTestUser();
			const channel = await prisma.channel.create({
				data: {
					emoji: "📢",
					name: "Auto Join Channel",
					slug: "auto-join-channel-ic",
					type: "public",
				},
			});

			await app.request("/api/invite-codes", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(creator) },
				body: JSON.stringify({
					code: "AUTOJOIN",
					maxUses: 10,
					autoJoinChannelId: channel.id,
				}),
			});

			await app.request("/api/invite-codes/validate", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ code: "AUTOJOIN" }),
			});

			const member = await prisma.channelMember.findUnique({
				where: {
					channelId_userId: {
						channelId: channel.id,
						userId: user.id,
					},
				},
			});
			expect(member).not.toBeNull();
		});

		it("should return 401 without auth", async () => {
			const res = await app.request("/api/invite-codes/validate", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({ code: "SOMECODE" }),
			});
			expect(res.status).toBe(401);
		});
	});

	describe("GET /api/invite-codes/:id/stats", () => {
		it("should get usage stats for an invite code", async () => {
			const user = await createTestUser();
			const createRes = await app.request("/api/invite-codes", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ maxUses: 10 }),
			});
			const createData = await createRes.json();
			const id = createData.data.id;

			const res = await app.request(`/api/invite-codes/${id}/stats`);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.code).toBeDefined();
			expect(data.data.maxUses).toBe(10);
			expect(data.data.usedCount).toBe(0);
			expect(data.data.remainingUses).toBe(10);
			expect(data.data.status).toBe("active");
		});

		it("should return 404 for non-existent invite code stats", async () => {
			const res = await app.request(
				"/api/invite-codes/00000000-0000-0000-0000-000000000000/stats",
			);
			expect(res.status).toBe(404);
		});
	});
});
