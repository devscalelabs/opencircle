import { prisma } from "../../utils/prisma";
import {
	NotFoundError,
	ConflictError,
	BadRequestError,
} from "../../exceptions";
import { generateId } from "../../utils/id";
import type {
	CreateInviteCodeInput,
	UpdateInviteCodeInput,
	ValidateInviteCodeInput,
	ListInviteCodesQuery,
	ChannelInviteCodesQuery,
} from "./schema";

function generateInviteCode(length = 8): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

export async function createInviteCode(
	data: CreateInviteCodeInput,
	createdBy: string,
) {
	const code = data.code || generateInviteCode();

	const existing = await prisma.inviteCode.findUnique({
		where: { code, deletedAt: null },
	});

	if (existing) {
		throw new ConflictError(`Invite code '${code}' already exists`);
	}

	return prisma.inviteCode.create({
		data: {
			id: generateId(),
			code,
			maxUses: data.maxUses,
			usedCount: 0,
			expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
			status: "active",
			createdBy,
			autoJoinChannelId: data.autoJoinChannelId,
		},
		include: {
			createdByUser: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
		},
	});
}

export async function getInviteCode(id: string) {
	const inviteCode = await prisma.inviteCode.findUnique({
		where: { id, deletedAt: null },
		include: {
			createdByUser: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
		},
	});

	if (!inviteCode) {
		throw new NotFoundError("Invite code");
	}

	return inviteCode;
}

export async function listInviteCodes(query: ListInviteCodesQuery) {
	const { page, limit, status, createdBy } = query;
	const skip = (page - 1) * limit;

	const where = {
		deletedAt: null,
		...(status && { status }),
		...(createdBy && { createdBy }),
	};

	const [items, total] = await Promise.all([
		prisma.inviteCode.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
			include: {
				createdByUser: {
					select: { id: true, username: true, name: true, avatarUrl: true },
				},
			},
		}),
		prisma.inviteCode.count({ where }),
	]);

	return { items, total, page, limit };
}

export async function getInviteCodesByChannel(
	channelId: string,
	query: ChannelInviteCodesQuery,
) {
	const { page, limit } = query;
	const skip = (page - 1) * limit;

	const where = {
		autoJoinChannelId: channelId,
		deletedAt: null,
	};

	const [items, total] = await Promise.all([
		prisma.inviteCode.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
		}),
		prisma.inviteCode.count({ where }),
	]);

	return { items, total, page, limit };
}

export async function updateInviteCode(
	id: string,
	data: UpdateInviteCodeInput,
) {
	const inviteCode = await prisma.inviteCode.findUnique({
		where: { id, deletedAt: null },
	});

	if (!inviteCode) {
		throw new NotFoundError("Invite code");
	}

	const updateData: Record<string, unknown> = { ...data };
	if (data.expiresAt !== undefined) {
		updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
	}

	return prisma.inviteCode.update({
		where: { id },
		data: updateData,
		include: {
			createdByUser: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
		},
	});
}

export async function deactivateInviteCode(id: string) {
	const inviteCode = await prisma.inviteCode.findUnique({
		where: { id, deletedAt: null },
	});

	if (!inviteCode) {
		throw new NotFoundError("Invite code");
	}

	return prisma.inviteCode.update({
		where: { id },
		data: { status: "expired" },
		include: {
			createdByUser: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
		},
	});
}

export async function deleteInviteCode(id: string) {
	const inviteCode = await prisma.inviteCode.findUnique({
		where: { id, deletedAt: null },
	});

	if (!inviteCode) {
		throw new NotFoundError("Invite code");
	}

	return prisma.inviteCode.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
}

export async function validateInviteCode(
	data: ValidateInviteCodeInput,
	userId: string,
) {
	const inviteCode = await prisma.inviteCode.findUnique({
		where: { code: data.code, deletedAt: null },
	});

	if (!inviteCode) {
		throw new BadRequestError("Invalid invite code");
	}

	if (inviteCode.status !== "active") {
		throw new BadRequestError(`Invite code is ${inviteCode.status}`);
	}

	if (inviteCode.expiresAt && new Date() > inviteCode.expiresAt) {
		await prisma.inviteCode.update({
			where: { id: inviteCode.id },
			data: { status: "expired" },
		});
		throw new BadRequestError("Invite code has expired");
	}

	if (inviteCode.usedCount >= inviteCode.maxUses) {
		await prisma.inviteCode.update({
			where: { id: inviteCode.id },
			data: { status: "used" },
		});
		throw new BadRequestError("Invite code has been fully used");
	}

	const updated = await prisma.inviteCode.update({
		where: { id: inviteCode.id },
		data: {
			usedCount: { increment: 1 },
			status:
				inviteCode.usedCount + 1 >= inviteCode.maxUses ? "used" : "active",
		},
		include: {
			createdByUser: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
		},
	});

	if (updated.autoJoinChannelId) {
		const existing = await prisma.channelMember.findUnique({
			where: {
				channelId_userId: {
					channelId: updated.autoJoinChannelId,
					userId,
				},
			},
		});

		if (!existing) {
			await prisma.channelMember.create({
				data: {
					id: generateId(),
					channelId: updated.autoJoinChannelId,
					userId,
				},
			});
		}
	}

	return updated;
}

export async function getInviteCodeStats(id: string) {
	const inviteCode = await prisma.inviteCode.findUnique({
		where: { id, deletedAt: null },
	});

	if (!inviteCode) {
		throw new NotFoundError("Invite code");
	}

	return {
		code: inviteCode.code,
		maxUses: inviteCode.maxUses,
		usedCount: inviteCode.usedCount,
		remainingUses: Math.max(0, inviteCode.maxUses - inviteCode.usedCount),
		status: inviteCode.status,
		expiresAt: inviteCode.expiresAt,
	};
}
