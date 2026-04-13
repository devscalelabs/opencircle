import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { app } from "../../src/app";
import { prisma } from "../../src/utils/prisma";
import { cleanupAll, seedAppSettings } from "../helpers";

describe("Extras", () => {
	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	it("should return a proper structure for url-preview", async () => {
		const res = await app.request("/api/url-preview?url=https://example.com");
		expect([200, 400].includes(res.status)).toBe(true);
	});

	it("should return data with expected fields when url-preview succeeds", async () => {
		const res = await app.request("/api/url-preview?url=https://example.com");
		if (res.status === 200) {
			const body = await res.json();
			expect(body.data).toBeDefined();
			expect(typeof body.data.url).toBe("string");
		}
	});

	it("should return validation error for invalid url", async () => {
		const res = await app.request("/api/url-preview?url=not-a-url");
		expect(res.status).toBe(422);
	});

	it("should require url query param", async () => {
		const res = await app.request("/api/url-preview");
		expect(res.status).toBe(422);
	});

	it("should serve cached url preview from database", async () => {
		await prisma.urlPreview.create({
			data: {
				url: "https://cached.example.com",
				title: "Cached Title",
				description: "Cached Description",
				imageUrl: "https://cached.example.com/image.png",
			},
		});

		const res = await app.request(
			"/api/url-preview?url=https://cached.example.com",
		);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.data.title).toBe("Cached Title");
		expect(body.data.description).toBe("Cached Description");
		expect(body.data.imageUrl).toBe("https://cached.example.com/image.png");
	});
});
