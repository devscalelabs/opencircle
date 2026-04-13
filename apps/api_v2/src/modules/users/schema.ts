import { z } from "zod";

export const createUserSchema = z.object({
	name: z.string().min(1).optional(),
	username: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(6),
	bio: z.string().optional(),
	avatarUrl: z.string().url().optional(),
});

export const updateUserSchema = z.object({
	name: z.string().min(1).optional(),
	bio: z.string().optional(),
	avatarUrl: z.string().url().optional(),
	username: z.string().min(1).optional(),
	email: z.string().email().optional(),
});

export const listUsersQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	search: z.string().optional(),
});
