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

describe("Users", () => {
	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	describe("POST /api/users", () => {
		it("should create a new user", async () => {
			const res = await app.request("/api/users", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					username: "newuser",
					email: "newuser@example.com",
					password: "password123",
				}),
			});
			expect(res.status).toBe(201);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(data.data.username).toBe("newuser");
			expect(data.data.email).toBe("newuser@example.com");
			expect(data.data.password).toBeUndefined();
		});

		it("should return 409 for duplicate username", async () => {
			await createTestUser({ username: "duplicateuser" });
			const res = await app.request("/api/users", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					username: "duplicateuser",
					email: "other@example.com",
					password: "password123",
				}),
			});
			expect(res.status).toBe(409);
		});

		it("should return 409 for duplicate email", async () => {
			await createTestUser({ email: "dup@example.com" });
			const res = await app.request("/api/users", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					username: "otheruser",
					email: "dup@example.com",
					password: "password123",
				}),
			});
			expect(res.status).toBe(409);
		});
	});

	describe("GET /api/users", () => {
		it("should return paginated list of users", async () => {
			await createTestUser({ username: "user1_list" });
			await createTestUser({ username: "user2_list" });

			const res = await app.request("/api/users");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(data.data.items).toBeDefined();
			expect(data.data.items.length).toBeGreaterThanOrEqual(2);
			expect(data.data.total).toBeGreaterThanOrEqual(2);
			expect(data.data.page).toBe(1);
		});

		it("should support pagination and search parameters", async () => {
			await createTestUser({ username: "searchuser", name: "Search Test" });

			const res = await app.request("/api/users?page=1&limit=10&search=search");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.items).toBeDefined();
		});
	});

	describe("GET /api/users/:id", () => {
		it("should return a user by id", async () => {
			const user = await createTestUser();
			const res = await app.request(`/api/users/${user.id}`);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(data.data.id).toBe(user.id);
			expect(data.data.username).toBe(user.username);
		});

		it("should return 404 for non-existent user", async () => {
			const res = await app.request(
				"/api/users/00000000-0000-0000-0000-000000000000",
			);
			expect(res.status).toBe(404);
		});
	});

	describe("PUT /api/users/:id", () => {
		it("should update a user with authentication", async () => {
			const user = await createTestUser({ name: "Original" });
			const res = await app.request(`/api/users/${user.id}`, {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ name: "Updated" }),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(data.data.name).toBe("Updated");
		});

		it("should return 401 without authentication", async () => {
			const user = await createTestUser();
			const res = await app.request(`/api/users/${user.id}`, {
				method: "PUT",
				headers: jsonHeaders(),
				body: JSON.stringify({ name: "Updated" }),
			});
			expect(res.status).toBe(401);
		});

		it("should return 409 when updating to existing username", async () => {
			const user1 = await createTestUser({ username: "user1_update" });
			const user2 = await createTestUser({ username: "user2_update" });
			const res = await app.request(`/api/users/${user1.id}`, {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user1) },
				body: JSON.stringify({ username: "user2_update" }),
			});
			expect(res.status).toBe(409);
		});
	});

	describe("DELETE /api/users/:id", () => {
		it("should soft delete a user with authentication", async () => {
			const user = await createTestUser();
			const res = await app.request(`/api/users/${user.id}`, {
				method: "DELETE",
				headers: getAuthHeaders(user),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.success).toBe(true);

			const getRes = await app.request(`/api/users/${user.id}`);
			expect(getRes.status).toBe(404);
		});

		it("should return 401 without authentication", async () => {
			const user = await createTestUser();
			const res = await app.request(`/api/users/${user.id}`, {
				method: "DELETE",
			});
			expect(res.status).toBe(401);
		});

		it("should return 404 for deleting non-existent user", async () => {
			const user = await createTestUser();
			const fakeId = "00000000-0000-0000-0000-000000000000";
			const res = await app.request(`/api/users/${fakeId}`, {
				method: "DELETE",
				headers: getAuthHeaders(user),
			});
			expect(res.status).toBe(404);
		});
	});

	describe("POST /api/users/:id/ban", () => {
		it("should ban a user when requested by admin", async () => {
			const admin = await createTestAdmin();
			const user = await createTestUser({ username: "ban_target" });
			const res = await app.request(`/api/users/${user.id}/ban`, {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(data.data.is_active).toBe(false);
		});

		it("should return 403 when requested by non-admin user", async () => {
			const user1 = await createTestUser({ username: "regular_user" });
			const user2 = await createTestUser({ username: "ban_target2" });
			const res = await app.request(`/api/users/${user2.id}/ban`, {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user1) },
			});
			expect(res.status).toBe(403);
		});

		it("should return 401 without authentication", async () => {
			const user = await createTestUser({ username: "ban_target3" });
			const res = await app.request(`/api/users/${user.id}/ban`, {
				method: "POST",
				headers: jsonHeaders(),
			});
			expect(res.status).toBe(401);
		});
	});
});
