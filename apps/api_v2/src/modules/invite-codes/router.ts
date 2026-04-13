import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import { authMiddleware } from "../../middleware/auth";
import {
	createInviteCodeSchema,
	updateInviteCodeSchema,
	validateInviteCodeSchema,
	listInviteCodesQuerySchema,
	channelInviteCodesQuerySchema,
} from "./schema";
import {
	createInviteCode,
	getInviteCode,
	listInviteCodes,
	getInviteCodesByChannel,
	updateInviteCode,
	deactivateInviteCode,
	deleteInviteCode,
	validateInviteCode,
	getInviteCodeStats,
} from "./service";

export const inviteCodesRouter = new Hono<Context>();

inviteCodesRouter.post(
	"/invite-codes",
	authMiddleware,
	zValidator("json", createInviteCodeSchema),
	async (c) => {
		const data = c.req.valid("json");
		const user = c.get("user") as NonNullable<Context["Variables"]["user"]>;
		const result = await createInviteCode(data, user.id);
		return c.json({ data: result }, 201);
	},
);

inviteCodesRouter.post(
	"/invite-codes/validate",
	authMiddleware,
	zValidator("json", validateInviteCodeSchema),
	async (c) => {
		const data = c.req.valid("json");
		const user = c.get("user") as NonNullable<Context["Variables"]["user"]>;
		const result = await validateInviteCode(data, user.id);
		return c.json({ data: result });
	},
);

inviteCodesRouter.get(
	"/invite-codes",
	zValidator("query", listInviteCodesQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const result = await listInviteCodes(query);
		return c.json({ data: result });
	},
);

inviteCodesRouter.get(
	"/invite-codes/channel/:channelId",
	zValidator("query", channelInviteCodesQuerySchema),
	async (c) => {
		const channelId = c.req.param("channelId");
		const query = c.req.valid("query");
		const result = await getInviteCodesByChannel(channelId, query);
		return c.json({ data: result });
	},
);

inviteCodesRouter.get("/invite-codes/:id/stats", async (c) => {
	const id = c.req.param("id");
	const result = await getInviteCodeStats(id);
	return c.json({ data: result });
});

inviteCodesRouter.get("/invite-codes/:id", async (c) => {
	const id = c.req.param("id");
	const result = await getInviteCode(id);
	return c.json({ data: result });
});

inviteCodesRouter.put(
	"/invite-codes/:id",
	authMiddleware,
	zValidator("json", updateInviteCodeSchema),
	async (c) => {
		const id = c.req.param("id");
		const data = c.req.valid("json");
		const result = await updateInviteCode(id, data);
		return c.json({ data: result });
	},
);

inviteCodesRouter.post(
	"/invite-codes/:id/deactivate",
	authMiddleware,
	async (c) => {
		const id = c.req.param("id");
		const result = await deactivateInviteCode(id);
		return c.json({ data: result });
	},
);

inviteCodesRouter.delete("/invite-codes/:id", authMiddleware, async (c) => {
	const id = c.req.param("id");
	const result = await deleteInviteCode(id);
	return c.json({ data: result });
});
