import { z } from "zod";

export const inviteCodeStatusEnum = z.enum(["active", "used", "expired"]);

export const createInviteCodeSchema = z.object({
	code: z.string().optional(),
	maxUses: z.number().int().positive().default(1),
	expiresAt: z.string().datetime().optional(),
	autoJoinChannelId: z.string().uuid().optional(),
});

export const updateInviteCodeSchema = z.object({
	maxUses: z.number().int().positive().optional(),
	expiresAt: z.string().datetime().nullable().optional(),
	autoJoinChannelId: z.string().uuid().nullable().optional(),
});

export const validateInviteCodeSchema = z.object({
	code: z.string().min(1),
});

export const listInviteCodesQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	status: inviteCodeStatusEnum.optional(),
	createdBy: z.string().uuid().optional(),
});

export const channelInviteCodesQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateInviteCodeInput = z.infer<typeof createInviteCodeSchema>;
export type UpdateInviteCodeInput = z.infer<typeof updateInviteCodeSchema>;
export type ValidateInviteCodeInput = z.infer<typeof validateInviteCodeSchema>;
export type ListInviteCodesQuery = z.infer<typeof listInviteCodesQuerySchema>;
export type ChannelInviteCodesQuery = z.infer<
	typeof channelInviteCodesQuerySchema
>;
