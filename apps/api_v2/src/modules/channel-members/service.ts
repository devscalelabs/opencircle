import { prisma } from "../../utils/prisma";
import { NotFoundError, ConflictError } from "../../exceptions";
import type {
	AddMemberInput,
	RemoveMemberInput,
	ListMembersQuery,
	CheckMemberQuery,
} from "./schema";

export async function addMember(data: AddMemberInput) {
	const channel = await prisma.channel.findUnique({
		where: { id: data.channelId, deletedAt: null },
	});
	if (!channel) {
		throw new NotFoundError("Channel");
	}

	const user = await prisma.user.findUnique({
		where: { id: data.userId },
	});
	if (!user) {
		throw new NotFoundError("User");
	}

	const existing = await prisma.channelMember.findUnique({
		where: {
			channelId_userId: {
				channelId: data.channelId,
				userId: data.userId,
			},
		},
	});
	if (existing) {
		throw new ConflictError("User is already a member of this channel");
	}

	const member = await prisma.channelMember.create({
		data: {
			channelId: data.channelId,
			userId: data.userId,
		},
		include: {
			user: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
			channel: { select: { id: true, name: true, slug: true } },
		},
	});

	return member;
}

export async function removeMember(data: RemoveMemberInput) {
	const member = await prisma.channelMember.findUnique({
		where: {
			channelId_userId: {
				channelId: data.channelId,
				userId: data.userId,
			},
		},
	});
	if (!member) {
		throw new NotFoundError("Channel member");
	}

	await prisma.channelMember.delete({
		where: { id: member.id },
	});

	return { channel_id: data.channelId, user_id: data.userId };
}

export async function listMembers(query: ListMembersQuery) {
	const channel = await prisma.channel.findUnique({
		where: { id: query.channelId, deletedAt: null },
	});
	if (!channel) {
		throw new NotFoundError("Channel");
	}

	const [members, total] = await Promise.all([
		prisma.channelMember.findMany({
			where: { channelId: query.channelId },
			skip: (query.page - 1) * query.limit,
			take: query.limit,
			orderBy: { createdAt: "desc" },
			include: {
				user: {
					select: { id: true, username: true, name: true, avatarUrl: true },
				},
			},
		}),
		prisma.channelMember.count({
			where: { channelId: query.channelId },
		}),
	]);

	return {
		data: members,
		meta: {
			page: query.page,
			limit: query.limit,
			total,
			total_pages: Math.ceil(total / query.limit),
		},
	};
}

export async function checkMembership(query: CheckMemberQuery) {
	const member = await prisma.channelMember.findUnique({
		where: {
			channelId_userId: {
				channelId: query.channelId,
				userId: query.userId,
			},
		},
	});

	return { is_member: !!member };
}
