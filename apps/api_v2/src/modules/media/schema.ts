import { z } from "zod";

export const mediaCreateSchema = z.object({
	url: z.string().url(),
	postId: z.string().uuid().optional(),
	userId: z.string().uuid(),
});

export const mediaUpdateSchema = z.object({
	url: z.string().url().optional(),
});

export const listMediasQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	postId: z.string().uuid().optional(),
	userId: z.string().uuid().optional(),
});

export type MediaCreateInput = z.infer<typeof mediaCreateSchema>;
export type MediaUpdateInput = z.infer<typeof mediaUpdateSchema>;
export type ListMediasQuery = z.infer<typeof listMediasQuerySchema>;
