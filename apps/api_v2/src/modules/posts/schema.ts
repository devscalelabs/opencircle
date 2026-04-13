import { z } from "zod";

export const postCreateSchema = z.object({
	title: z.string().optional(),
	content: z.string().min(1),
	type: z.enum(["post", "comment", "article", "poll"]).default("post"),
	channelId: z.string().uuid().optional(),
	parentId: z.string().uuid().optional(),
	isPinned: z.boolean().default(false),
});

export const postUpdateSchema = z.object({
	title: z.string().optional(),
	content: z.string().min(1).optional(),
	type: z.enum(["post", "comment", "article", "poll"]).optional(),
	isPinned: z.boolean().optional(),
});

export const listPostsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	userId: z.string().uuid().optional(),
	postType: z.enum(["post", "comment", "article", "poll"]).optional(),
	parentId: z.string().uuid().optional(),
	channelSlug: z.string().optional(),
});

export const postWithFilesSchema = z.object({
	title: z.string().optional(),
	content: z.string().min(1),
	type: z.enum(["post", "comment", "article", "poll"]).default("post"),
	channelId: z.string().uuid().optional(),
	parentId: z.string().uuid().optional(),
	isPinned: z.boolean().default(false),
});

export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
export type PostWithFilesInput = z.infer<typeof postWithFilesSchema>;
