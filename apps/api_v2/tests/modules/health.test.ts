import { describe, it, expect } from "vitest";
import { app } from "../../src/app";

describe("Health", () => {
	it("should return ok status", async () => {
		const res = await app.request("/health");
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.status).toBe("ok");
	});
});
