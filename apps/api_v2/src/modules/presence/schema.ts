import { z } from "zod";

export const timeseriesQuerySchema = z.object({
	interval: z.enum(["hour", "day"]).default("hour"),
	from: z.string().datetime().optional(),
	to: z.string().datetime().optional(),
});

export const presenceUserQuerySchema = z.object({
	user_id: z.string().uuid().optional(),
	limit: z.coerce.number().int().positive().max(100).default(100).optional(),
});

export type TimeseriesQuery = z.infer<typeof timeseriesQuerySchema>;
export type PresenceUserQuery = z.infer<typeof presenceUserQuerySchema>;
