import { z } from "zod";

export const articleCreateSchema = z.object({
	title: z.string().min(1),
	content: z.string().min(1),
	channelId: z.string().uuid().optional(),
});

export const articleUpdateSchema = z.object({
	title: z.string().min(1).optional(),
	content: z.string().min(1).optional(),
});

export const listArticlesQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	userId: z.string().uuid().optional(),
});

export type ArticleCreateInput = z.infer<typeof articleCreateSchema>;
export type ArticleUpdateInput = z.infer<typeof articleUpdateSchema>;
export type ListArticlesQuery = z.infer<typeof listArticlesQuerySchema>;
