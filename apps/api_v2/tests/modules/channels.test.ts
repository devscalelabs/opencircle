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

describe("Channels", () => {
	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	it("should create a channel", async () => {
		const user = await createTestUser();
		const res = await app.request("/api/channels", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				name: "General",
				slug: "general",
				description: "General discussion",
				type: "public",
			}),
		});
		expect(res.status).toBe(201);
		const data = await res.json();
		expect(data.data).toBeDefined();
		expect(data.data.name).toBe("General");
		expect(data.data.slug).toBe("general");
		expect(data.data.type).toBe("public");
	});

	it("should create a private channel and auto-add creator as member", async () => {
		const user = await createTestUser();
		const res = await app.request("/api/channels", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				name: "Private Channel",
				slug: "private-channel",
				type: "private",
			}),
		});
		expect(res.status).toBe(201);
		const data = await res.json();
		expect(data.data.type).toBe("private");

		const member = await prisma.channelMember.findFirst({
			where: { channelId: data.data.id, userId: user.id },
		});
		expect(member).not.toBeNull();
	});

	it("should reject duplicate channel slug", async () => {
		const user = await createTestUser();
		const body = JSON.stringify({
			name: "Channel A",
			slug: "same-slug",
			type: "public",
		});
		await app.request("/api/channels", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body,
		});
		const res = await app.request("/api/channels", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body,
		});
		expect(res.status).toBe(409);
	});

	it("should get a public channel by id", async () => {
		const user = await createTestUser();
		const createRes = await app.request("/api/channels", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				name: "Public Channel",
				slug: "public-channel",
				type: "public",
			}),
		});
		const { data: channel } = await createRes.json();

		const res = await app.request(`/api/channels/${channel.id}`);
		expect(res.status).toBe(200);
		const result = await res.json();
		expect(result.data.id).toBe(channel.id);
	});

	it("should get a private channel if user is a member", async () => {
		const user = await createTestUser();
		const createRes = await app.request("/api/channels", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				name: "Private Channel",
				slug: "private-channel",
				type: "private",
			}),
		});
		const { data: channel } = await createRes.json();

		const res = await app.request(`/api/channels/${channel.id}`, {
			headers: getAuthHeaders(user),
		});
		expect(res.status).toBe(200);
	});

	it("should deny access to private channel for non-member", async () => {
		const owner = await createTestUser();
		const other = await createTestUser();
		const createRes = await app.request("/api/channels", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(owner) },
			body: JSON.stringify({
				name: "Secret Channel",
				slug: "secret-channel",
				type: "private",
			}),
		});
		const { data: channel } = await createRes.json();

		const res = await app.request(`/api/channels/${channel.id}`, {
			headers: getAuthHeaders(other),
		});
		expect(res.status).toBe(403);
	});

	it("should allow admin to access private channel", async () => {
		const owner = await createTestUser();
		const admin = await createTestAdmin();
		const createRes = await app.request("/api/channels", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(owner) },
			body: JSON.stringify({
				name: "Admin Visible Channel",
				slug: "admin-visible-channel",
				type: "private",
			}),
		});
		const { data: channel } = await createRes.json();

		const res = await app.request(`/api/channels/${channel.id}`, {
			headers: getAuthHeaders(admin),
		});
		expect(res.status).toBe(200);
	});

	it("should list only public channels for unauthenticated users", async () => {
		const user = await createTestUser();
		await app.request("/api/channels", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				name: "Public Channel",
				slug: "public-1",
				type: "public",
			}),
		});
		await app.request("/api/channels", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				name: "Private Channel",
				slug: "private-1",
				type: "private",
			}),
		});

		const res = await app.request("/api/channels");
		expect(res.status).toBe(200);
		const result = await res.json();
		expect(result.data.length).toBe(1);
		expect(result.data[0].type).toBe("public");
	});

	it("should list public + member private channels for authenticated user", async () => {
		const user = await createTestUser();
		await app.request("/api/channels", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				name: "Public Channel",
				slug: "public-2",
				type: "public",
			}),
		});
		await app.request("/api/channels", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				name: "My Private Channel",
				slug: "my-private-2",
				type: "private",
			}),
		});

		const res = await app.request("/api/channels", {
			headers: getAuthHeaders(user),
		});
		expect(res.status).toBe(200);
		const result = await res.json();
		expect(result.data.length).toBe(2);
	});

	it("should update a channel", async () => {
		const user = await createTestUser();
		const createRes = await app.request("/api/channels", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				name: "Original",
				slug: "original",
				type: "public",
			}),
		});
		const { data: channel } = await createRes.json();

		const res = await app.request(`/api/channels/${channel.id}`, {
			method: "PUT",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({ name: "Updated", description: "New desc" }),
		});
		expect(res.status).toBe(200);
		const result = await res.json();
		expect(result.data.name).toBe("Updated");
		expect(result.data.description).toBe("New desc");
	});

	it("should return 404 when updating non-existent channel", async () => {
		const user = await createTestUser();
		const res = await app.request(
			`/api/channels/00000000-0000-0000-0000-000000000000`,
			{
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ name: "Nope" }),
			},
		);
		expect(res.status).toBe(404);
	});

	it("should delete a channel as admin", async () => {
		const admin = await createTestAdmin();
		const createRes = await app.request("/api/channels", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
			body: JSON.stringify({
				name: "To Delete",
				slug: "to-delete",
				type: "public",
			}),
		});
		const { data: channel } = await createRes.json();

		const res = await app.request(`/api/channels/${channel.id}`, {
			method: "DELETE",
			headers: getAuthHeaders(admin),
		});
		expect(res.status).toBe(200);

		const getRes = await app.request(`/api/channels/${channel.id}`);
		expect(getRes.status).toBe(404);
	});

	it("should forbid non-admin from deleting a channel", async () => {
		const user = await createTestUser();
		const createRes = await app.request("/api/channels", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				name: "No Delete",
				slug: "no-delete",
				type: "public",
			}),
		});
		const { data: channel } = await createRes.json();

		const res = await app.request(`/api/channels/${channel.id}`, {
			method: "DELETE",
			headers: getAuthHeaders(user),
		});
		expect(res.status).toBe(403);
	});

	it("should require authentication to create channel", async () => {
		const res = await app.request("/api/channels", {
			method: "POST",
			headers: jsonHeaders(),
			body: JSON.stringify({
				name: "No Auth",
				slug: "no-auth",
				type: "public",
			}),
		});
		expect(res.status).toBe(401);
	});

	it("should validate channel creation payload", async () => {
		const user = await createTestUser();
		const res = await app.request("/api/channels", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({}),
		});
		expect(res.status).toBe(422);
	});
});
