import { z } from "zod";

export const addMemberSchema = z.object({
	channelId: z.string().uuid(),
	userId: z.string().uuid(),
});

export const removeMemberSchema = z.object({
	channelId: z.string().uuid(),
	userId: z.string().uuid(),
});

export const listMembersQuerySchema = z.object({
	channelId: z.string().uuid(),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
});

export const checkMemberQuerySchema = z.object({
	channelId: z.string().uuid(),
	userId: z.string().uuid(),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;
export type CheckMemberQuery = z.infer<typeof checkMemberQuerySchema>;
