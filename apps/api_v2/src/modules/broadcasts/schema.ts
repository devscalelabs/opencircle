import { z } from "zod";

export const broadcastCreateSchema = z.object({
	subject: z.string().min(1),
	content: z.string().min(1),
	recipientType: z.enum(["all_users", "test_email", "channel_members"]),
	testEmail: z.string().email().optional(),
	channelId: z.string().uuid().optional(),
});

export const broadcastUpdateSchema = z.object({
	subject: z.string().min(1).optional(),
	content: z.string().min(1).optional(),
	recipientType: z
		.enum(["all_users", "test_email", "channel_members"])
		.optional(),
	testEmail: z.string().email().optional(),
	channelId: z.string().uuid().optional(),
});

export const broadcastSendTestSchema = z.object({
	email: z.string().email(),
});

export const listBroadcastsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
});

export type BroadcastCreateInput = z.infer<typeof broadcastCreateSchema>;
export type BroadcastUpdateInput = z.infer<typeof broadcastUpdateSchema>;
export type BroadcastSendTestInput = z.infer<typeof broadcastSendTestSchema>;
export type ListBroadcastsQuery = z.infer<typeof listBroadcastsQuerySchema>;
