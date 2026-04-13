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

describe("Media", () => {
	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	it("should create a media", async () => {
		const user = await createTestUser();
		const res = await app.request("/api/medias", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				url: "https://example.com/image.png",
				userId: user.id,
			}),
		});
		expect(res.status).toBe(201);
		const data = await res.json();
		expect(data.data).toBeDefined();
		expect(data.data.url).toBe("https://example.com/image.png");
		expect(data.data.userId).toBe(user.id);
	});

	it("should create a media linked to a post", async () => {
		const user = await createTestUser();
		const channel = await prisma.channel.create({
			data: {
				name: "Media Channel",
				slug: "media-channel",
				type: "public",
			},
		});
		const post = await prisma.post.create({
			data: {
				content: "A post for media",
				userId: user.id,
				channelId: channel.id,
			},
		});

		const res = await app.request("/api/medias", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				url: "https://example.com/post-image.png",
				userId: user.id,
				postId: post.id,
			}),
		});
		expect(res.status).toBe(201);
		const data = await res.json();
		expect(data.data.postId).toBe(post.id);
	});

	it("should get a media by id", async () => {
		const user = await createTestUser();
		const createRes = await app.request("/api/medias", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				url: "https://example.com/get-media.png",
				userId: user.id,
			}),
		});
		const { data: media } = await createRes.json();

		const res = await app.request(`/api/medias/${media.id}`);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.data.id).toBe(media.id);
		expect(data.data.url).toBe("https://example.com/get-media.png");
	});

	it("should return 404 for non-existent media", async () => {
		const res = await app.request(
			"/api/medias/00000000-0000-0000-0000-000000000000",
		);
		expect(res.status).toBe(404);
	});

	it("should list medias with pagination", async () => {
		const user = await createTestUser();
		await app.request("/api/medias", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				url: "https://example.com/media1.png",
				userId: user.id,
			}),
		});
		await app.request("/api/medias", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				url: "https://example.com/media2.png",
				userId: user.id,
			}),
		});

		const res = await app.request("/api/medias");
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.data.items.length).toBe(2);
		expect(data.data.total).toBe(2);
	});

	it("should filter medias by userId", async () => {
		const user1 = await createTestUser();
		const user2 = await createTestUser();
		await app.request("/api/medias", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user1) },
			body: JSON.stringify({
				url: "https://example.com/u1-media.png",
				userId: user1.id,
			}),
		});
		await app.request("/api/medias", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user2) },
			body: JSON.stringify({
				url: "https://example.com/u2-media.png",
				userId: user2.id,
			}),
		});

		const res = await app.request(`/api/medias?userId=${user1.id}`);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.data.items.length).toBe(1);
		expect(data.data.items[0].userId).toBe(user1.id);
	});

	it("should update a media", async () => {
		const user = await createTestUser();
		const createRes = await app.request("/api/medias", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				url: "https://example.com/original.png",
				userId: user.id,
			}),
		});
		const { data: media } = await createRes.json();

		const res = await app.request(`/api/medias/${media.id}`, {
			method: "PUT",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				url: "https://example.com/updated.png",
			}),
		});
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.data.url).toBe("https://example.com/updated.png");
	});

	it("should return 404 when updating non-existent media", async () => {
		const user = await createTestUser();
		const res = await app.request(
			"/api/medias/00000000-0000-0000-0000-000000000000",
			{
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					url: "https://example.com/nope.png",
				}),
			},
		);
		expect(res.status).toBe(404);
	});

	it("should delete a media (soft delete)", async () => {
		const user = await createTestUser();
		const createRes = await app.request("/api/medias", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				url: "https://example.com/to-delete.png",
				userId: user.id,
			}),
		});
		const { data: media } = await createRes.json();

		const res = await app.request(`/api/medias/${media.id}`, {
			method: "DELETE",
			headers: getAuthHeaders(user),
		});
		expect(res.status).toBe(200);

		const getRes = await app.request(`/api/medias/${media.id}`);
		expect(getRes.status).toBe(404);
	});

	it("should require authentication to create media", async () => {
		const res = await app.request("/api/medias", {
			method: "POST",
			headers: jsonHeaders(),
			body: JSON.stringify({
				url: "https://example.com/no-auth.png",
				userId: "fake",
			}),
		});
		expect(res.status).toBe(401);
	});

	it("should validate media creation payload", async () => {
		const user = await createTestUser();
		const res = await app.request("/api/medias", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({}),
		});
		expect(res.status).toBe(422);
	});
});
