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

describe("Settings", () => {
	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	describe("GET /api/settings", () => {
		it("should get app settings", async () => {
			const res = await app.request("/api/settings");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(data.data.id).toBe("singleton");
			expect(data.data.appName).toBe("OpenCircle");
			expect(data.data.enableSignUp).toBe(true);
			expect(data.data.enableOpencircleBranding).toBe(true);
		});

		it("should include oauth flags in response", async () => {
			const res = await app.request("/api/settings");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.oauthGithubEnabled).toBeDefined();
			expect(data.data.oauthGoogleEnabled).toBeDefined();
		});

		it("should return 404 when settings do not exist", async () => {
			await prisma.appSettings.deleteMany();
			const res = await app.request("/api/settings");
			expect(res.status).toBe(404);
		});
	});

	describe("PUT /api/settings", () => {
		it("should update app settings with auth", async () => {
			const user = await createTestUser();
			const res = await app.request("/api/settings", {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					appName: "My App",
					enableSignUp: false,
				}),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.appName).toBe("My App");
			expect(data.data.enableSignUp).toBe(false);
		});

		it("should partially update app settings", async () => {
			const user = await createTestUser();
			const res = await app.request("/api/settings", {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					appName: "Updated Name",
				}),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.appName).toBe("Updated Name");
			expect(data.data.enableSignUp).toBe(true);
		});

		it("should return 401 without auth", async () => {
			const res = await app.request("/api/settings", {
				method: "PUT",
				headers: jsonHeaders(),
				body: JSON.stringify({ appName: "No Auth" }),
			});
			expect(res.status).toBe(401);
		});
	});

	describe("POST /api/settings/upload-logo", () => {
		it("should return 400 when no file is provided", async () => {
			const user = await createTestUser();
			const res = await app.request("/api/settings/upload-logo", {
				method: "POST",
				headers: getAuthHeaders(user),
			});
			expect(res.status).toBe(400);
		});

		it("should return 401 without auth", async () => {
			const res = await app.request("/api/settings/upload-logo", {
				method: "POST",
			});
			expect(res.status).toBe(401);
		});
	});

	describe("GET /api/settings/count", () => {
		it("should return count of app settings records", async () => {
			const res = await app.request("/api/settings/count");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.count).toBeDefined();
			expect(data.data.count).toBeGreaterThanOrEqual(1);
		});
	});

	describe("GET /api/settings/installation-status", () => {
		it("should return installation status with admin", async () => {
			await createTestAdmin();
			const res = await app.request("/api/settings/installation-status");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.isInstalled).toBe(true);
			expect(data.data.adminCount).toBeGreaterThanOrEqual(1);
		});

		it("should return not installed when no admin exists", async () => {
			const res = await app.request("/api/settings/installation-status");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.isInstalled).toBe(false);
			expect(data.data.adminCount).toBe(0);
		});
	});
});
