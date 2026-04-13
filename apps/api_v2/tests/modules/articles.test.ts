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

describe("Articles", () => {
	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	it("should create an article", async () => {
		const user = await createTestUser();
		const res = await app.request("/api/articles", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				title: "My First Article",
				content: "This is the content of my article.",
			}),
		});
		expect(res.status).toBe(201);
		const data = await res.json();
		expect(data.data).toBeDefined();
		expect(data.data.title).toBe("My First Article");
		expect(data.data.content).toBe("This is the content of my article.");
		expect(data.data.type).toBe("article");
	});

	it("should create an article with a channel", async () => {
		const user = await createTestUser();
		const channel = await prisma.channel.create({
			data: {
				name: "Article Channel",
				slug: "article-channel",
				type: "public",
			},
		});

		const res = await app.request("/api/articles", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				title: "Article in Channel",
				content: "Content here",
				channelId: channel.id,
			}),
		});
		expect(res.status).toBe(201);
		const data = await res.json();
		expect(data.data.channelId).toBe(channel.id);
	});

	it("should get an article by id", async () => {
		const user = await createTestUser();
		const createRes = await app.request("/api/articles", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				title: "Get This Article",
				content: "Readable content",
			}),
		});
		const { data: article } = await createRes.json();

		const res = await app.request(`/api/articles/${article.id}`);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.data.id).toBe(article.id);
		expect(data.data.type).toBe("article");
	});

	it("should return 404 for non-existent article", async () => {
		const res = await app.request(
			"/api/articles/00000000-0000-0000-0000-000000000000",
		);
		expect(res.status).toBe(404);
	});

	it("should list articles with pagination", async () => {
		const user = await createTestUser();
		await app.request("/api/articles", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				title: "Article 1",
				content: "Content 1",
			}),
		});
		await app.request("/api/articles", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				title: "Article 2",
				content: "Content 2",
			}),
		});

		const res = await app.request("/api/articles");
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.data.items.length).toBe(2);
		expect(data.data.total).toBe(2);
	});

	it("should filter articles by userId", async () => {
		const user1 = await createTestUser();
		const user2 = await createTestUser();
		await app.request("/api/articles", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user1) },
			body: JSON.stringify({
				title: "User1 Article",
				content: "Content",
			}),
		});
		await app.request("/api/articles", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user2) },
			body: JSON.stringify({
				title: "User2 Article",
				content: "Content",
			}),
		});

		const res = await app.request(`/api/articles?userId=${user1.id}`);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.data.items.length).toBe(1);
		expect(data.data.items[0].userId).toBe(user1.id);
	});

	it("should update an article", async () => {
		const user = await createTestUser();
		const createRes = await app.request("/api/articles", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				title: "Original Title",
				content: "Original content",
			}),
		});
		const { data: article } = await createRes.json();

		const res = await app.request(`/api/articles/${article.id}`, {
			method: "PUT",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				title: "Updated Title",
				content: "Updated content",
			}),
		});
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.data.title).toBe("Updated Title");
		expect(data.data.content).toBe("Updated content");
	});

	it("should forbid non-owner from updating article", async () => {
		const owner = await createTestUser();
		const other = await createTestUser();
		const createRes = await app.request("/api/articles", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(owner) },
			body: JSON.stringify({
				title: "Owners Article",
				content: "Content",
			}),
		});
		const { data: article } = await createRes.json();

		const res = await app.request(`/api/articles/${article.id}`, {
			method: "PUT",
			headers: { ...jsonHeaders(), ...getAuthHeaders(other) },
			body: JSON.stringify({ title: "Hacked" }),
		});
		expect(res.status).toBe(403);
	});

	it("should allow admin to update any article", async () => {
		const owner = await createTestUser();
		const admin = await createTestAdmin();
		const createRes = await app.request("/api/articles", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(owner) },
			body: JSON.stringify({
				title: "Admin Editable",
				content: "Content",
			}),
		});
		const { data: article } = await createRes.json();

		const res = await app.request(`/api/articles/${article.id}`, {
			method: "PUT",
			headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
			body: JSON.stringify({ title: "Admin Updated" }),
		});
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.data.title).toBe("Admin Updated");
	});

	it("should delete an article", async () => {
		const user = await createTestUser();
		const createRes = await app.request("/api/articles", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				title: "To Delete",
				content: "Content",
			}),
		});
		const { data: article } = await createRes.json();

		const res = await app.request(`/api/articles/${article.id}`, {
			method: "DELETE",
			headers: getAuthHeaders(user),
		});
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.data.deleted).toBe(true);

		const getRes = await app.request(`/api/articles/${article.id}`);
		expect(getRes.status).toBe(404);
	});

	it("should forbid non-owner from deleting article", async () => {
		const owner = await createTestUser();
		const other = await createTestUser();
		const createRes = await app.request("/api/articles", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(owner) },
			body: JSON.stringify({
				title: "Protected Article",
				content: "Content",
			}),
		});
		const { data: article } = await createRes.json();

		const res = await app.request(`/api/articles/${article.id}`, {
			method: "DELETE",
			headers: getAuthHeaders(other),
		});
		expect(res.status).toBe(403);
	});

	it("should allow admin to delete any article", async () => {
		const owner = await createTestUser();
		const admin = await createTestAdmin();
		const createRes = await app.request("/api/articles", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(owner) },
			body: JSON.stringify({
				title: "Admin Deletable",
				content: "Content",
			}),
		});
		const { data: article } = await createRes.json();

		const res = await app.request(`/api/articles/${article.id}`, {
			method: "DELETE",
			headers: getAuthHeaders(admin),
		});
		expect(res.status).toBe(200);
	});

	it("should require authentication to create article", async () => {
		const res = await app.request("/api/articles", {
			method: "POST",
			headers: jsonHeaders(),
			body: JSON.stringify({
				title: "No Auth",
				content: "Content",
			}),
		});
		expect(res.status).toBe(401);
	});

	it("should validate article creation payload", async () => {
		const user = await createTestUser();
		const res = await app.request("/api/articles", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({}),
		});
		expect(res.status).toBe(422);
	});
});
