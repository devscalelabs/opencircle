import { z } from "zod";

export const appLinkCreateSchema = z.object({
	label: z.string().min(1),
	url: z.string().url(),
});

export const appLinkUpdateSchema = z.object({
	label: z.string().min(1).optional(),
	url: z.string().url().optional(),
});

export const listAppLinksQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
});

export type AppLinkCreateInput = z.infer<typeof appLinkCreateSchema>;
export type AppLinkUpdateInput = z.infer<typeof appLinkUpdateSchema>;
export type ListAppLinksQuery = z.infer<typeof listAppLinksQuerySchema>;
