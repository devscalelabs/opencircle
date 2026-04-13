import { z } from "zod";

export const resourceCreateSchema = z.object({
	url: z.string().url(),
	description: z.string().optional(),
	channelId: z.string().uuid(),
});

export const resourceUpdateSchema = z.object({
	url: z.string().url().optional(),
	description: z.string().optional(),
});

export const listResourcesQuerySchema = z.object({
	channelId: z.string().uuid().optional(),
	userId: z.string().uuid().optional(),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ResourceCreateInput = z.infer<typeof resourceCreateSchema>;
export type ResourceUpdateInput = z.infer<typeof resourceUpdateSchema>;
export type ListResourcesQuery = z.infer<typeof listResourcesQuerySchema>;
