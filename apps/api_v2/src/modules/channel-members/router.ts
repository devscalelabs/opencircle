import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import { authMiddleware } from "../../middleware/auth";
import {
	addMemberSchema,
	removeMemberSchema,
	listMembersQuerySchema,
	checkMemberQuerySchema,
} from "./schema";
import {
	addMember,
	removeMember,
	listMembers,
	checkMembership,
} from "./service";

export const channelMembersRouter = new Hono<Context>();

channelMembersRouter.post(
	"/channel-members",
	authMiddleware,
	zValidator("json", addMemberSchema),
	async (c) => {
		const data = c.req.valid("json");
		const member = await addMember(data);
		return c.json({ data: member }, 201);
	},
);

channelMembersRouter.delete(
	"/channel-members",
	authMiddleware,
	zValidator("json", removeMemberSchema),
	async (c) => {
		const data = c.req.valid("json");
		const result = await removeMember(data);
		return c.json({ data: result });
	},
);

channelMembersRouter.get(
	"/channel-members",
	authMiddleware,
	zValidator("query", listMembersQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const result = await listMembers(query);
		return c.json({ data: result.data, meta: result.meta });
	},
);

channelMembersRouter.get(
	"/channel-members/check",
	authMiddleware,
	zValidator("query", checkMemberQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const result = await checkMembership(query);
		return c.json({ data: result });
	},
);
