import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import { authMiddleware } from "../../middleware/auth";
import { settingsUpdateSchema } from "./schema";
import {
	getSettings,
	updateSettings,
	uploadLogo,
	getCount,
	getInstallationStatus,
} from "./service";

export const settingsRouter = new Hono<Context>()
	.get("/settings", async (c) => {
		const result = await getSettings();
		return c.json({ data: result });
	})
	.put(
		"/settings",
		authMiddleware,
		zValidator("json", settingsUpdateSchema),
		async (c) => {
			const data = c.req.valid("json");
			const result = await updateSettings(data);
			return c.json({ data: result });
		},
	)
	.post("/settings/upload-logo", authMiddleware, async (c) => {
		const body = await c.req.parseBody();
		const file = body["file"];

		if (!file || !(file instanceof File)) {
			return c.json({ error: "No file provided" }, 400);
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const result = await uploadLogo({
			name: file.name,
			type: file.type,
			data: buffer,
		});

		return c.json({ data: result });
	})
	.get("/settings/count", async (c) => {
		const result = await getCount();
		return c.json({ data: result });
	})
	.get("/settings/installation-status", async (c) => {
		const result = await getInstallationStatus();
		return c.json({ data: result });
	});
