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

describe("Auth", () => {
	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	describe("POST /api/register", () => {
		it("should register a new user successfully", async () => {
			const res = await app.request("/api/register", {
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
			expect(data.data.message).toBe("User registered successfully");
			expect(data.data.user_id).toBeDefined();
		});

		it("should return 409 for duplicate username", async () => {
			await createTestUser({ username: "existinguser" });
			const res = await app.request("/api/register", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					username: "existinguser",
					email: "different@example.com",
					password: "password123",
				}),
			});
			expect(res.status).toBe(409);
			const data = await res.json();
			expect(data.error).toContain("Username already registered");
		});

		it("should return 409 for duplicate email", async () => {
			await createTestUser({ email: "existing@example.com" });
			const res = await app.request("/api/register", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					username: "differentuser",
					email: "existing@example.com",
					password: "password123",
				}),
			});
			expect(res.status).toBe(409);
			const data = await res.json();
			expect(data.error).toContain("Email already registered");
		});

		it("should return 403 when sign up is disabled", async () => {
			await prisma.appSettings.update({
				where: { id: "singleton" },
				data: { enableSignUp: false },
			});
			const res = await app.request("/api/register", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					username: "newuser",
					email: "newuser@example.com",
					password: "password123",
				}),
			});
			expect(res.status).toBe(403);
			const data = await res.json();
			expect(data.error).toContain("Registration is currently disabled");
		});
	});

	describe("POST /api/login", () => {
		it("should login successfully with valid credentials", async () => {
			const user = await createTestUser({
				username: "loginuser",
				email: "loginuser@example.com",
			});
			const res = await app.request("/api/login", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					username: user.username,
					password: "password123",
				}),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.access_token).toBeDefined();
			expect(data.data.refresh_token).toBeDefined();
			expect(data.data.token_type).toBe("bearer");
		});

		it("should return 401 for wrong password", async () => {
			const user = await createTestUser({ username: "wrongpass" });
			const res = await app.request("/api/login", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					username: user.username,
					password: "wrongpassword",
				}),
			});
			expect(res.status).toBe(401);
			const data = await res.json();
			expect(data.error).toContain("Invalid credentials");
		});

		it("should return 401 for non-existent user", async () => {
			const res = await app.request("/api/login", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					username: "nonexistent",
					password: "password123",
				}),
			});
			expect(res.status).toBe(401);
			const data = await res.json();
			expect(data.error).toContain("Invalid credentials");
		});
	});

	describe("POST /api/refresh", () => {
		it("should refresh token successfully with valid refresh token", async () => {
			const user = await createTestUser({
				username: "refreshuser",
				email: "refreshuser@example.com",
			});
			const loginRes = await app.request("/api/login", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					username: user.username,
					password: "password123",
				}),
			});
			const loginData = await loginRes.json();
			const refreshToken =
				loginRes.status === 200 ? loginData.data.refresh_token : null;

			const res = await app.request("/api/refresh", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({ refresh_token: refreshToken }),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.access_token).toBeDefined();
			expect(data.data.token_type).toBe("bearer");
		});

		it("should return 401 for invalid refresh token", async () => {
			const res = await app.request("/api/refresh", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({ refresh_token: "invalid-token" }),
			});
			expect(res.status).toBe(401);
			const data = await res.json();
			expect(data.error).toContain("Invalid or expired refresh token");
		});
	});

	describe("POST /api/logout", () => {
		it("should logout successfully with valid refresh token", async () => {
			const user = await createTestUser({
				username: "logoutuser",
				email: "logoutuser@example.com",
			});
			const loginRes = await app.request("/api/login", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					username: user.username,
					password: "password123",
				}),
			});
			const loginData = await loginRes.json();
			const refreshToken =
				loginRes.status === 200 ? loginData.data.refresh_token : null;

			const res = await app.request("/api/logout", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({ refresh_token: refreshToken }),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.message).toBe("Successfully logged out");
		});

		it("should still return success with invalid refresh token", async () => {
			const res = await app.request("/api/logout", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({ refresh_token: "invalid-token" }),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.message).toBe("Successfully logged out");
		});
	});

	describe("POST /api/reset-password", () => {
		it("should create a password reset request", async () => {
			await createTestUser({
				email: "reset@example.com",
			});
			const res = await app.request("/api/reset-password", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({ email: "reset@example.com" }),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.message).toBeDefined();
			const resetRecord = await prisma.passwordReset.findFirst({
				where: { email: "reset@example.com", status: "active" },
			});
			expect(resetRecord).not.toBeNull();
		});

		it("should still return success for non-existent email", async () => {
			const res = await app.request("/api/reset-password", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({ email: "nonexistent@example.com" }),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.message).toBeDefined();
		});
	});

	describe("POST /api/verify-email", () => {
		it("should verify email with valid code", async () => {
			const registerRes = await app.request("/api/register", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({
					username: "verifyuser",
					email: "verify@example.com",
					password: "password123",
				}),
			});
			expect(registerRes.status).toBe(201);

			const verification = await prisma.emailVerification.findFirst({
				where: { email: "verify@example.com", status: "active" },
			});
			expect(verification).not.toBeNull();

			const res = await app.request("/api/verify-email", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({ code: verification!.code }),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.message).toBe("Email verified successfully");
		});

		it("should return 400 for invalid verification code", async () => {
			const res = await app.request("/api/verify-email", {
				method: "POST",
				headers: jsonHeaders(),
				body: JSON.stringify({ code: "INVALID" }),
			});
			expect(res.status).toBe(400);
			const data = await res.json();
			expect(data.error).toContain("Invalid or expired verification code");
		});
	});
});
