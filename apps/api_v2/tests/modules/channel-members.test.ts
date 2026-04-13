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

describe("Channel Members", () => {
	let channelId: string;
	let channelPrivateId: string;

	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();

		const user = await createTestUser();
		const channelRes = await app.request("/api/channels", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				name: "Test Channel",
				slug: "test-channel",
				type: "public",
			}),
		});
		const channelData = await channelRes.json();
		channelId = channelData.data.id;

		const privateRes = await app.request("/api/channels", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				name: "Private Channel",
				slug: "private-channel",
				type: "private",
			}),
		});
		const privateData = await privateRes.json();
		channelPrivateId = privateData.data.id;
	});

	afterAll(async () => {
		await cleanupAll();
	});

	it("should add a member to a channel", async () => {
		const newUser = await createTestUser();
		const res = await app.request("/api/channel-members", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(newUser) },
			body: JSON.stringify({
				channelId,
				userId: newUser.id,
			}),
		});
		expect(res.status).toBe(201);
		const data = await res.json();
		expect(data.data).toBeDefined();
		expect(data.data.channelId).toBe(channelId);
		expect(data.data.userId).toBe(newUser.id);
	});

	it("should reject duplicate member addition", async () => {
		const newUser = await createTestUser();
		await app.request("/api/channel-members", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(newUser) },
			body: JSON.stringify({
				channelId,
				userId: newUser.id,
			}),
		});

		const res = await app.request("/api/channel-members", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(newUser) },
			body: JSON.stringify({
				channelId,
				userId: newUser.id,
			}),
		});
		expect(res.status).toBe(409);
	});

	it("should return 404 when adding to non-existent channel", async () => {
		const user = await createTestUser();
		const res = await app.request("/api/channel-members", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				channelId: "00000000-0000-0000-0000-000000000000",
				userId: user.id,
			}),
		});
		expect(res.status).toBe(404);
	});

	it("should remove a member from a channel", async () => {
		const newUser = await createTestUser();
		await app.request("/api/channel-members", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(newUser) },
			body: JSON.stringify({
				channelId,
				userId: newUser.id,
			}),
		});

		const res = await app.request("/api/channel-members", {
			method: "DELETE",
			headers: { ...jsonHeaders(), ...getAuthHeaders(newUser) },
			body: JSON.stringify({
				channelId,
				userId: newUser.id,
			}),
		});
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.data.channel_id).toBe(channelId);
		expect(data.data.user_id).toBe(newUser.id);
	});

	it("should return 404 when removing non-existent member", async () => {
		const user = await createTestUser();
		const res = await app.request("/api/channel-members", {
			method: "DELETE",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
			body: JSON.stringify({
				channelId,
				userId: user.id,
			}),
		});
		expect(res.status).toBe(404);
	});

	it("should list members of a channel", async () => {
		const user1 = await createTestUser();
		const user2 = await createTestUser();

		await app.request("/api/channel-members", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user1) },
			body: JSON.stringify({ channelId, userId: user1.id }),
		});
		await app.request("/api/channel-members", {
			method: "POST",
			headers: { ...jsonHeaders(), ...getAuthHeaders(user2) },
			body: JSON.stringify({ channelId, userId: user2.id }),
		});

		const res = await app.request(
			`/api/channel-members?channelId=${channelId}`,
			{
				headers: getAuthHeaders(user1),
			},
		);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.data.length).toBe(2);
		expect(data.meta).toBeDefined();
		expect(data.meta.total).toBe(2);
	});

	it("should check membership - is member", async () => {
		const owner = await createTestUser();
		const checkRes = await app.request(
			`/api/channel-members/check?channelId=${channelPrivateId}&userId=${owner.id}`,
			{
				headers: getAuthHeaders(owner),
			},
		);
		expect(checkRes.status).toBe(200);
		const checkData = await checkRes.json();
		expect(checkData.data.is_member).toBe(true);
	});

	it("should check membership - is not member", async () => {
		const outsider = await createTestUser();
		const checkRes = await app.request(
			`/api/channel-members/check?channelId=${channelId}&userId=${outsider.id}`,
			{
				headers: getAuthHeaders(outsider),
			},
		);
		expect(checkRes.status).toBe(200);
		const checkData = await checkRes.json();
		expect(checkData.data.is_member).toBe(false);
	});

	it("should require authentication for adding member", async () => {
		const res = await app.request("/api/channel-members", {
			method: "POST",
			headers: jsonHeaders(),
			body: JSON.stringify({ channelId, userId: "fake" }),
		});
		expect(res.status).toBe(401);
	});
});
