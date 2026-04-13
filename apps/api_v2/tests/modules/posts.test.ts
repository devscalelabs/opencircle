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

describe("Posts", () => {
	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	describe("POST /api/posts", () => {
		it("should create a post with authentication", async () => {
			const user = await createTestUser();
			const res = await app.request("/api/posts", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					content: "Hello world",
				}),
			});
			expect(res.status).toBe(201);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(data.data.content).toBe("Hello world");
			expect(data.data.userId).toBe(user.id);
		});

		it("should create a post with title", async () => {
			const user = await createTestUser();
			const res = await app.request("/api/posts", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "My Title",
					content: "Post content",
				}),
			});
			expect(res.status).toBe(201);
			const data = await res.json();
			expect(data.data.title).toBe("My Title");
		});

		it("should return 401 without authentication", async () => {
			const res = await app.request("/api/posts", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({ content: "test" }),
			});
			expect(res.status).toBe(401);
		});

		it("should return validation error for empty content", async () => {
			const user = await createTestUser();
			const res = await app.request("/api/posts", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({}),
			});
			expect(res.status).toBe(400);
		});
	});

	describe("GET /api/posts", () => {
		it("should return paginated list of posts", async () => {
			const user = await createTestUser();
			await prisma.post.create({
				data: { content: "Post 1", userId: user.id },
			});
			await prisma.post.create({
				data: { content: "Post 2", userId: user.id },
			});

			const res = await app.request("/api/posts");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(Array.isArray(data.data)).toBe(true);
			expect(data.data.length).toBe(2);
			expect(data.meta).toBeDefined();
			expect(data.meta.total).toBe(2);
		});

		it("should return empty list when no posts exist", async () => {
			const res = await app.request("/api/posts");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(data.data.length).toBe(0);
			expect(data.meta.total).toBe(0);
		});

		it("should support pagination parameters", async () => {
			const user = await createTestUser();
			for (let i = 0; i < 5; i++) {
				await prisma.post.create({
					data: { content: `Post ${i}`, userId: user.id },
				});
			}

			const res = await app.request("/api/posts?page=1&limit=2");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.length).toBe(2);
			expect(data.meta.page).toBe(1);
			expect(data.meta.limit).toBe(2);
			expect(data.meta.total).toBe(5);
		});
	});

	describe("GET /api/posts/:id", () => {
		it("should return a single post", async () => {
			const user = await createTestUser();
			const post = await prisma.post.create({
				data: { content: "Single post", userId: user.id },
			});

			const res = await app.request(`/api/posts/${post.id}`);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(data.data.id).toBe(post.id);
			expect(data.data.content).toBe("Single post");
		});

		it("should return 404 for non-existent post", async () => {
			const res = await app.request(
				"/api/posts/00000000-0000-0000-0000-000000000000",
			);
			expect(res.status).toBe(404);
		});
	});

	describe("PUT /api/posts/:id", () => {
		it("should update a post by the owner", async () => {
			const user = await createTestUser();
			const post = await prisma.post.create({
				data: { content: "Original", userId: user.id },
			});

			const res = await app.request(`/api/posts/${post.id}`, {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ content: "Updated" }),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.content).toBe("Updated");
		});

		it("should update a post by admin", async () => {
			const user = await createTestUser({ username: "post_owner_admin" });
			const admin = await createTestAdmin();
			const post = await prisma.post.create({
				data: { content: "Admin update", userId: user.id },
			});

			const res = await app.request(`/api/posts/${post.id}`, {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({ content: "Admin edited" }),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.content).toBe("Admin edited");
		});

		it("should return 403 when updating another user post as regular user", async () => {
			const user1 = await createTestUser({ username: "post_owner_forbidden" });
			const user2 = await createTestUser({
				username: "post_updater_forbidden",
			});
			const post = await prisma.post.create({
				data: { content: "Someone else post", userId: user1.id },
			});

			const res = await app.request(`/api/posts/${post.id}`, {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user2) },
				body: JSON.stringify({ content: "Attempted update" }),
			});
			expect(res.status).toBe(403);
		});

		it("should return 401 without authentication", async () => {
			const user = await createTestUser({ username: "put_no_auth" });
			const post = await prisma.post.create({
				data: { content: "No auth", userId: user.id },
			});

			const res = await app.request(`/api/posts/${post.id}`, {
				method: "PUT",
				headers: jsonHeaders(),
				body: JSON.stringify({ content: "Update" }),
			});
			expect(res.status).toBe(401);
		});

		it("should return 404 for updating non-existent post", async () => {
			const user = await createTestUser({ username: "update_nonexist" });
			const res = await app.request(
				"/api/posts/00000000-0000-0000-0000-000000000000",
				{
					method: "PUT",
					headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
					body: JSON.stringify({ content: "Update" }),
				},
			);
			expect(res.status).toBe(404);
		});
	});

	describe("DELETE /api/posts/:id", () => {
		it("should soft delete a post by the owner", async () => {
			const user = await createTestUser();
			const post = await prisma.post.create({
				data: { content: "To delete", userId: user.id },
			});

			const res = await app.request(`/api/posts/${post.id}`, {
				method: "DELETE",
				headers: getAuthHeaders(user),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.id).toBe(post.id);

			const getRes = await app.request(`/api/posts/${post.id}`);
			expect(getRes.status).toBe(404);
		});

		it("should soft delete a post by admin", async () => {
			const user = await createTestUser({ username: "delete_target" });
			const admin = await createTestAdmin();
			const post = await prisma.post.create({
				data: { content: "Admin delete", userId: user.id },
			});

			const res = await app.request(`/api/posts/${post.id}`, {
				method: "DELETE",
				headers: getAuthHeaders(admin),
			});
			expect(res.status).toBe(200);
		});

		it("should return 404 for deleting non-existent post", async () => {
			const user = await createTestUser({ username: "del_nonexist" });
			const res = await app.request(
				"/api/posts/00000000-0000-0000-0000-000000000000",
				{
					method: "DELETE",
					headers: getAuthHeaders(user),
				},
			);
			expect(res.status).toBe(404);
		});

		it("should soft delete without authentication (anonymous)", async () => {
			const user = await createTestUser({ username: "del_no_auth_post" });
			const post = await prisma.post.create({
				data: { content: "Public delete", userId: user.id },
			});

			const res = await app.request(`/api/posts/${post.id}`, {
				method: "DELETE",
			});
			expect(res.status).toBe(200);
		});
	});
});
