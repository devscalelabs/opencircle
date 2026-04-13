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

describe("Reactions", () => {
	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	async function createTestPost(userId: string) {
		const channel = await prisma.channel.create({
			data: {
				name: "Reaction Test Channel",
				slug: `reaction-test-${Date.now()}`,
				type: "public",
			},
		});
		return prisma.post.create({
			data: {
				content: "A post for reactions",
				userId,
				channelId: channel.id,
			},
		});
	}

	it("should toggle reaction - add a new reaction", async () => {
		const user = await createTestUser();
		const post = await createTestPost(user.id);

		const res = await app.request("/api/reactions", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				postId: post.id,
				emoji: "like",
			}),
		});
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.data).toBeDefined();
		expect(data.data.reaction).toBeDefined();
		expect(data.data.reaction.emoji).toBe("like");
		expect(data.data.reaction.postId).toBe(post.id);
		expect(data.data.removed).toBe(false);
	});

	it("should toggle reaction - remove existing reaction", async () => {
		const user = await createTestUser();
		const post = await createTestPost(user.id);

		await app.request("/api/reactions", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				postId: post.id,
				emoji: "like",
			}),
		});

		const res = await app.request("/api/reactions", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				postId: post.id,
				emoji: "like",
			}),
		});
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.data.removed).toBe(true);
	});

	it("should get grouped reactions for a post", async () => {
		const user1 = await createTestUser();
		const user2 = await createTestUser();
		const post = await createTestPost(user1.id);

		await app.request("/api/reactions", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user1) },
			body: JSON.stringify({ postId: post.id, emoji: "like" }),
		});
		await app.request("/api/reactions", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user2) },
			body: JSON.stringify({ postId: post.id, emoji: "like" }),
		});
		await app.request("/api/reactions", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user1) },
			body: JSON.stringify({ postId: post.id, emoji: "fire" }),
		});

		const res = await app.request(`/api/reactions/${post.id}`);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.data).toBeDefined();

		const likeGroup = data.data.find(
			(g: { emoji: string; count: number }) => g.emoji === "like",
		);
		const fireGroup = data.data.find(
			(g: { emoji: string; count: number }) => g.emoji === "fire",
		);
		expect(likeGroup.count).toBe(2);
		expect(fireGroup.count).toBe(1);
	});

	it("should return 404 for reactions on non-existent post", async () => {
		const res = await app.request(
			"/api/reactions/00000000-0000-0000-0000-000000000000",
		);
		expect(res.status).toBe(404);
	});

	it("should delete a reaction by query params", async () => {
		const user = await createTestUser();
		const post = await createTestPost(user.id);

		await app.request("/api/reactions", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({ postId: post.id, emoji: "like" }),
		});

		const res = await app.request(
			`/api/reactions?postId=${post.id}&emoji=like`,
			{
				method: "DELETE",
				headers: getAuthHeaders(user),
			},
		);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.data.deleted).toBe(true);
	});

	it("should return 404 when deleting non-existent reaction", async () => {
		const user = await createTestUser();
		const post = await createTestPost(user.id);

		const res = await app.request(
			`/api/reactions?postId=${post.id}&emoji=shrug`,
			{
				method: "DELETE",
				headers: getAuthHeaders(user),
			},
		);
		expect(res.status).toBe(404);
	});

	it("should allow multiple different reactions on same post", async () => {
		const user = await createTestUser();
		const post = await createTestPost(user.id);

		await app.request("/api/reactions", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({ postId: post.id, emoji: "like" }),
		});
		const res = await app.request("/api/reactions", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({ postId: post.id, emoji: "fire" }),
		});
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.data.removed).toBe(false);
		expect(data.data.reaction.emoji).toBe("fire");
	});

	it("should require authentication to create reaction", async () => {
		const res = await app.request("/api/reactions", {
			method: "POST",
			headers: jsonHeaders(),
			body: JSON.stringify({
				postId: "00000000-0000-0000-0000-000000000000",
				emoji: "like",
			}),
		});
		expect(res.status).toBe(401);
	});

	it("should require authentication to delete reaction", async () => {
		const res = await app.request(
			"/api/reactions?postId=00000000-0000-0000-0000-000000000000&emoji=like",
			{
				method: "DELETE",
			},
		);
		expect(res.status).toBe(401);
	});
});
