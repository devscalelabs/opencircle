import { z } from "zod";

export const channelCreateSchema = z.object({
	emoji: z.string().optional(),
	name: z.string().min(1),
	description: z.string().optional(),
	slug: z.string().min(1),
	type: z.enum(["public", "private"]).default("public"),
});

export const channelUpdateSchema = z.object({
	emoji: z.string().optional(),
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	type: z.enum(["public", "private"]).optional(),
});

export const listChannelsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	type: z.enum(["public", "private"]).optional(),
});

export type ChannelCreateInput = z.infer<typeof channelCreateSchema>;
export type ChannelUpdateInput = z.infer<typeof channelUpdateSchema>;
export type ListChannelsQuery = z.infer<typeof listChannelsQuerySchema>;
