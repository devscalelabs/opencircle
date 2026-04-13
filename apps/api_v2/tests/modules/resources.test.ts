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

describe("Resources", () => {
	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	async function createTestChannel(
		type: "public" | "private" = "public",
		slugSuffix = "1",
	) {
		return prisma.channel.create({
			data: {
				emoji: "📚",
				name: `Test Channel ${slugSuffix}`,
				slug: `test-channel-res-${slugSuffix}`,
				type,
			},
		});
	}

	describe("POST /api/resources", () => {
		it("should create a resource with auth in a public channel", async () => {
			const user = await createTestUser();
			const channel = await createTestChannel("public", "pub1");

			const res = await app.request("/api/resources", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					url: "https://example.com/resource",
					description: "A useful resource",
					channelId: channel.id,
				}),
			});
			expect(res.status).toBe(201);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(data.data.url).toBe("https://example.com/resource");
			expect(data.data.description).toBe("A useful resource");
			expect(data.data.userId).toBe(user.id);
			expect(data.data.channelId).toBe(channel.id);
			expect(data.data.user).toBeDefined();
			expect(data.data.channel).toBeDefined();
		});

		it("should create a resource in a private channel when user is a member", async () => {
			const user = await createTestUser();
			const channel = await createTestChannel("private", "priv1");
			await prisma.channelMember.create({
				data: {
					id: `mem-${Date.now()}`,
					channelId: channel.id,
					userId: user.id,
				},
			});

			const res = await app.request("/api/resources", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					url: "https://example.com/private-resource",
					channelId: channel.id,
				}),
			});
			expect(res.status).toBe(201);
		});

		it("should return 403 when creating resource in private channel without membership", async () => {
			const user = await createTestUser();
			const channel = await createTestChannel("private", "priv2");

			const res = await app.request("/api/resources", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					url: "https://example.com/forbidden",
					channelId: channel.id,
				}),
			});
			expect(res.status).toBe(403);
		});

		it("should return 404 for non-existent channel", async () => {
			const user = await createTestUser();

			const res = await app.request("/api/resources", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					url: "https://example.com/resource",
					channelId: "00000000-0000-0000-0000-000000000000",
				}),
			});
			expect(res.status).toBe(404);
		});

		it("should return 401 without auth", async () => {
			const channel = await createTestChannel("public", "noauth");
			const res = await app.request("/api/resources", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					url: "https://example.com/resource",
					channelId: channel.id,
				}),
			});
			expect(res.status).toBe(401);
		});
	});

	describe("GET /api/resources", () => {
		it("should list resources without auth", async () => {
			const user = await createTestUser();
			const channel = await createTestChannel("public", "list1");
			await prisma.resource.create({
				data: {
					url: "https://example.com/res1",
					userId: user.id,
					channelId: channel.id,
				},
			});

			const res = await app.request("/api/resources");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.length).toBe(1);
			expect(data.meta).toBeDefined();
			expect(data.meta.total).toBe(1);
		});

		it("should filter resources by channelId", async () => {
			const user = await createTestUser();
			const channel1 = await createTestChannel("public", "filter1");
			const channel2 = await createTestChannel("public", "filter2");
			await prisma.resource.create({
				data: {
					url: "https://example.com/res-ch1",
					userId: user.id,
					channelId: channel1.id,
				},
			});
			await prisma.resource.create({
				data: {
					url: "https://example.com/res-ch2",
					userId: user.id,
					channelId: channel2.id,
				},
			});

			const res = await app.request(`/api/resources?channelId=${channel1.id}`);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.length).toBe(1);
		});

		it("should filter resources by userId", async () => {
			const user1 = await createTestUser();
			const user2 = await createTestUser();
			const channel = await createTestChannel("public", "userfilter");
			await prisma.resource.create({
				data: {
					url: "https://example.com/res-u1",
					userId: user1.id,
					channelId: channel.id,
				},
			});
			await prisma.resource.create({
				data: {
					url: "https://example.com/res-u2",
					userId: user2.id,
					channelId: channel.id,
				},
			});

			const res = await app.request(`/api/resources?userId=${user1.id}`);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.length).toBe(1);
		});

		it("should return 403 when listing private channel resources without membership", async () => {
			const user = await createTestUser();
			const channel = await createTestChannel("private", "privlist");

			const res = await app.request(`/api/resources?channelId=${channel.id}`);
			expect(res.status).toBe(403);
		});

		it("should list private channel resources for a member", async () => {
			const user = await createTestUser();
			const channel = await createTestChannel("private", "privlist2");
			await prisma.channelMember.create({
				data: {
					id: `mem-${Date.now()}`,
					channelId: channel.id,
					userId: user.id,
				},
			});
			await prisma.resource.create({
				data: {
					url: "https://example.com/priv-res",
					userId: user.id,
					channelId: channel.id,
				},
			});

			const res = await app.request(`/api/resources?channelId=${channel.id}`, {
				headers: getAuthHeaders(user),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.length).toBe(1);
		});
	});

	describe("GET /api/resources/:id", () => {
		it("should get a resource by ID", async () => {
			const user = await createTestUser();
			const channel = await createTestChannel("public", "get1");
			const resource = await prisma.resource.create({
				data: {
					url: "https://example.com/get-res",
					userId: user.id,
					channelId: channel.id,
				},
			});

			const res = await app.request(`/api/resources/${resource.id}`);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.id).toBe(resource.id);
			expect(data.data.user).toBeDefined();
			expect(data.data.channel).toBeDefined();
		});

		it("should return 404 for non-existent resource", async () => {
			const res = await app.request(
				"/api/resources/00000000-0000-0000-0000-000000000000",
			);
			expect(res.status).toBe(404);
		});

		it("should return 403 for private channel resource without auth", async () => {
			const user = await createTestUser();
			const channel = await createTestChannel("private", "privget");
			await prisma.channelMember.create({
				data: {
					id: `mem-${Date.now()}`,
					channelId: channel.id,
					userId: user.id,
				},
			});
			const resource = await prisma.resource.create({
				data: {
					url: "https://example.com/priv-get",
					userId: user.id,
					channelId: channel.id,
				},
			});

			const res = await app.request(`/api/resources/${resource.id}`);
			expect(res.status).toBe(403);
		});

		it("should return private channel resource for a member", async () => {
			const user = await createTestUser();
			const channel = await createTestChannel("private", "privget2");
			await prisma.channelMember.create({
				data: {
					id: `mem-${Date.now()}`,
					channelId: channel.id,
					userId: user.id,
				},
			});
			const resource = await prisma.resource.create({
				data: {
					url: "https://example.com/priv-get-member",
					userId: user.id,
					channelId: channel.id,
				},
			});

			const res = await app.request(`/api/resources/${resource.id}`, {
				headers: getAuthHeaders(user),
			});
			expect(res.status).toBe(200);
		});
	});

	describe("PUT /api/resources/:id", () => {
		it("should update own resource", async () => {
			const user = await createTestUser();
			const channel = await createTestChannel("public", "upd1");
			const resource = await prisma.resource.create({
				data: {
					url: "https://example.com/original",
					userId: user.id,
					channelId: channel.id,
				},
			});

			const res = await app.request(`/api/resources/${resource.id}`, {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					description: "Updated description",
				}),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.description).toBe("Updated description");
		});

		it("should return 403 when updating another user's resource", async () => {
			const owner = await createTestUser();
			const otherUser = await createTestUser();
			const channel = await createTestChannel("public", "upd2");
			const resource = await prisma.resource.create({
				data: {
					url: "https://example.com/other-user-res",
					userId: owner.id,
					channelId: channel.id,
				},
			});

			const res = await app.request(`/api/resources/${resource.id}`, {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(otherUser) },
				body: JSON.stringify({ description: "Try update" }),
			});
			expect(res.status).toBe(403);
		});

		it("should return 404 for non-existent resource", async () => {
			const user = await createTestUser();
			const res = await app.request(
				"/api/resources/00000000-0000-0000-0000-000000000000",
				{
					method: "PUT",
					headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
					body: JSON.stringify({ description: "Nope" }),
				},
			);
			expect(res.status).toBe(404);
		});

		it("should return 401 without auth", async () => {
			const res = await app.request(
				"/api/resources/00000000-0000-0000-0000-000000000000",
				{
					method: "PUT",
					headers: jsonHeaders(),
					body: JSON.stringify({ description: "Nope" }),
				},
			);
			expect(res.status).toBe(401);
		});
	});

	describe("DELETE /api/resources/:id", () => {
		it("should delete own resource", async () => {
			const user = await createTestUser();
			const channel = await createTestChannel("public", "del1");
			const resource = await prisma.resource.create({
				data: {
					url: "https://example.com/to-delete",
					userId: user.id,
					channelId: channel.id,
				},
			});

			const res = await app.request(`/api/resources/${resource.id}`, {
				method: "DELETE",
				headers: getAuthHeaders(user),
			});
			expect(res.status).toBe(200);

			const getRes = await app.request(`/api/resources/${resource.id}`);
			expect(getRes.status).toBe(404);
		});

		it("should allow admin to delete any resource", async () => {
			const user = await createTestUser();
			const admin = await createTestAdmin();
			const channel = await createTestChannel("public", "del2");
			const resource = await prisma.resource.create({
				data: {
					url: "https://example.com/admin-delete",
					userId: user.id,
					channelId: channel.id,
				},
			});

			const res = await app.request(`/api/resources/${resource.id}`, {
				method: "DELETE",
				headers: getAuthHeaders(admin),
			});
			expect(res.status).toBe(200);
		});

		it("should return 403 when deleting another user's resource as non-admin", async () => {
			const owner = await createTestUser();
			const otherUser = await createTestUser();
			const channel = await createTestChannel("public", "del3");
			const resource = await prisma.resource.create({
				data: {
					url: "https://example.com/other-del",
					userId: owner.id,
					channelId: channel.id,
				},
			});

			const res = await app.request(`/api/resources/${resource.id}`, {
				method: "DELETE",
				headers: getAuthHeaders(otherUser),
			});
			expect(res.status).toBe(403);
		});

		it("should return 404 for non-existent resource", async () => {
			const user = await createTestUser();
			const res = await app.request(
				"/api/resources/00000000-0000-0000-0000-000000000000",
				{
					method: "DELETE",
					headers: getAuthHeaders(user),
				},
			);
			expect(res.status).toBe(404);
		});

		it("should return 401 without auth", async () => {
			const res = await app.request(
				"/api/resources/00000000-0000-0000-0000-000000000000",
				{
					method: "DELETE",
				},
			);
			expect(res.status).toBe(401);
		});
	});
});
