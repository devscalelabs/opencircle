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

describe("App Links", () => {
	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	describe("POST /api/applinks", () => {
		it("should create an app link as admin", async () => {
			const admin = await createTestAdmin();
			const res = await app.request("/api/applinks", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({
					label: "GitHub",
					url: "https://github.com",
				}),
			});
			expect(res.status).toBe(201);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(data.data.label).toBe("GitHub");
			expect(data.data.url).toBe("https://github.com");
		});

		it("should return 403 for non-admin", async () => {
			const user = await createTestUser();
			const res = await app.request("/api/applinks", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					label: "GitHub",
					url: "https://github.com",
				}),
			});
			expect(res.status).toBe(403);
		});

		it("should return 401 without auth", async () => {
			const res = await app.request("/api/applinks", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					label: "GitHub",
					url: "https://github.com",
				}),
			});
			expect(res.status).toBe(401);
		});

		it("should validate input", async () => {
			const admin = await createTestAdmin();
			const res = await app.request("/api/applinks", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({
					label: "",
					url: "not-a-url",
				}),
			});
			expect(res.status).toBe(400);
		});
	});

	describe("GET /api/applinks", () => {
		it("should list app links publicly", async () => {
			const admin = await createTestAdmin();
			await app.request("/api/applinks", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({
					label: "GitHub",
					url: "https://github.com",
				}),
			});

			const res = await app.request("/api/applinks");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.items).toBeDefined();
			expect(data.data.items.length).toBe(1);
			expect(data.data.total).toBe(1);
		});

		it("should support pagination", async () => {
			const admin = await createTestAdmin();
			for (let i = 0; i < 5; i++) {
				await app.request("/api/applinks", {
					method: "POST",
					headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
					body: JSON.stringify({
						label: `Link ${i}`,
						url: `https://example${i}.com`,
					}),
				});
			}

			const res = await app.request("/api/applinks?page=1&limit=3");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.items.length).toBe(3);
			expect(data.data.total).toBe(5);
		});
	});

	describe("GET /api/applinks/:id", () => {
		it("should get an app link by ID publicly", async () => {
			const admin = await createTestAdmin();
			const createRes = await app.request("/api/applinks", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({
					label: "Docs",
					url: "https://docs.example.com",
				}),
			});
			const createData = await createRes.json();
			const id = createData.data.id;

			const res = await app.request(`/api/applinks/${id}`);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.id).toBe(id);
			expect(data.data.label).toBe("Docs");
		});

		it("should return 404 for non-existent app link", async () => {
			const res = await app.request(
				"/api/applinks/00000000-0000-0000-0000-000000000000",
			);
			expect(res.status).toBe(404);
		});
	});

	describe("PUT /api/applinks/:id", () => {
		it("should update an app link as admin", async () => {
			const admin = await createTestAdmin();
			const createRes = await app.request("/api/applinks", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({
					label: "Old Label",
					url: "https://old.example.com",
				}),
			});
			const createData = await createRes.json();
			const id = createData.data.id;

			const res = await app.request(`/api/applinks/${id}`, {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({
					label: "New Label",
					url: "https://new.example.com",
				}),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.label).toBe("New Label");
			expect(data.data.url).toBe("https://new.example.com");
		});

		it("should return 404 for non-existent app link", async () => {
			const admin = await createTestAdmin();
			const res = await app.request(
				"/api/applinks/00000000-0000-0000-0000-000000000000",
				{
					method: "PUT",
					headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
					body: JSON.stringify({ label: "Test" }),
				},
			);
			expect(res.status).toBe(404);
		});

		it("should return 403 for non-admin", async () => {
			const user = await createTestUser();
			const res = await app.request(
				"/api/applinks/00000000-0000-0000-0000-000000000000",
				{
					method: "PUT",
					headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
					body: JSON.stringify({ label: "Test" }),
				},
			);
			expect(res.status).toBe(403);
		});

		it("should return 401 without auth", async () => {
			const res = await app.request(
				"/api/applinks/00000000-0000-0000-0000-000000000000",
				{
					method: "PUT",
					headers: jsonHeaders(),
					body: JSON.stringify({ label: "Test" }),
				},
			);
			expect(res.status).toBe(401);
		});
	});

	describe("DELETE /api/applinks/:id", () => {
		it("should soft-delete an app link as admin", async () => {
			const admin = await createTestAdmin();
			const createRes = await app.request("/api/applinks", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({
					label: "To Delete",
					url: "https://delete.example.com",
				}),
			});
			const createData = await createRes.json();
			const id = createData.data.id;

			const res = await app.request(`/api/applinks/${id}`, {
				method: "DELETE",
				headers: getAuthHeaders(admin),
			});
			expect(res.status).toBe(200);

			const getRes = await app.request(`/api/applinks/${id}`);
			expect(getRes.status).toBe(404);
		});

		it("should return 404 for non-existent app link", async () => {
			const admin = await createTestAdmin();
			const res = await app.request(
				"/api/applinks/00000000-0000-0000-0000-000000000000",
				{
					method: "DELETE",
					headers: getAuthHeaders(admin),
				},
			);
			expect(res.status).toBe(404);
		});

		it("should return 403 for non-admin", async () => {
			const user = await createTestUser();
			const res = await app.request(
				"/api/applinks/00000000-0000-0000-0000-000000000000",
				{
					method: "DELETE",
					headers: getAuthHeaders(user),
				},
			);
			expect(res.status).toBe(403);
		});

		it("should return 401 without auth", async () => {
			const res = await app.request(
				"/api/applinks/00000000-0000-0000-0000-000000000000",
				{
					method: "DELETE",
				},
			);
			expect(res.status).toBe(401);
		});
	});
});
