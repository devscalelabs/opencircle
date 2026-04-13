import { z } from "zod";

export const urlPreviewQuerySchema = z.object({
	url: z.string().url(),
});

export type UrlPreviewQuery = z.infer<typeof urlPreviewQuerySchema>;
