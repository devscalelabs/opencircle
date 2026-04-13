import { prisma } from "../../utils/prisma";
import { NotFoundError, ForbiddenError, ConflictError } from "../../exceptions";
import type {
	ChannelCreateInput,
	ChannelUpdateInput,
	ListChannelsQuery,
} from "./schema";

export async function createChannel(data: ChannelCreateInput, userId: string) {
	const existing = await prisma.channel.findUnique({
		where: { slug: data.slug },
	});
	if (existing) {
		throw new ConflictError("Channel slug already exists");
	}

	const channel = await prisma.channel.create({
		data: {
			emoji: data.emoji,
			name: data.name,
			description: data.description,
			slug: data.slug,
			type: data.type,
		},
		include: {
			members: true,
			_count: { select: { members: true, posts: true } },
		},
	});

	if (data.type === "private") {
		await prisma.channelMember.create({
			data: {
				channelId: channel.id,
				userId,
			},
		});
	}

	return channel;
}

export async function getChannel(channelId: string, userId?: string) {
	const channel = await prisma.channel.findUnique({
		where: { id: channelId, deletedAt: null },
		include: {
			members: {
				include: {
					user: {
						select: { id: true, username: true, name: true, avatarUrl: true },
					},
				},
			},
			_count: { select: { members: true, posts: true } },
		},
	});

	if (!channel) {
		throw new NotFoundError("Channel");
	}

	if (channel.type === "private") {
		if (!userId) {
			throw new ForbiddenError("You are not a member of this private channel");
		}
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { role: true },
		});
		const membership = await prisma.channelMember.findUnique({
			where: {
				channelId_userId: {
					channelId: channel.id,
					userId,
				},
			},
		});
		if (!membership && user?.role !== "admin") {
			throw new ForbiddenError("You are not a member of this private channel");
		}
	}

	return channel;
}

export async function listChannels(query: ListChannelsQuery, userId?: string) {
	const where: Record<string, unknown> = {
		deletedAt: null,
	};

	if (query.type) {
		where.type = query.type;
	}

	if (!userId) {
		where.type = "public";
	} else {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { role: true },
		});
		if (user?.role !== "admin") {
			const memberChannelIds = await prisma.channelMember.findMany({
				where: { userId },
				select: { channelId: true },
			});
			const memberIds = memberChannelIds.map(
				(m: { channelId: string }) => m.channelId,
			);
			where.OR = [
				{ type: "public" },
				{ type: "private", id: { in: memberIds } },
			];
			delete where.type;
		}
	}

	const [channels, total] = await Promise.all([
		prisma.channel.findMany({
			where,
			skip: (query.page - 1) * query.limit,
			take: query.limit,
			orderBy: { createdAt: "desc" },
			include: {
				_count: { select: { members: true, posts: true } },
			},
		}),
		prisma.channel.count({ where }),
	]);

	return {
		data: channels,
		meta: {
			page: query.page,
			limit: query.limit,
			total,
			total_pages: Math.ceil(total / query.limit),
		},
	};
}

export async function updateChannel(
	channelId: string,
	data: ChannelUpdateInput,
	userId: string,
) {
	const channel = await prisma.channel.findUnique({
		where: { id: channelId, deletedAt: null },
	});

	if (!channel) {
		throw new NotFoundError("Channel");
	}

	if (channel.type === "private") {
		const membership = await prisma.channelMember.findUnique({
			where: {
				channelId_userId: {
					channelId,
					userId,
				},
			},
		});
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { role: true },
		});
		if (!membership && user?.role !== "admin") {
			throw new ForbiddenError("You are not a member of this private channel");
		}
	}

	const updatedChannel = await prisma.channel.update({
		where: { id: channelId },
		data: {
			...(data.emoji !== undefined && { emoji: data.emoji }),
			...(data.name !== undefined && { name: data.name }),
			...(data.description !== undefined && { description: data.description }),
			...(data.type !== undefined && { type: data.type }),
		},
		include: {
			members: true,
			_count: { select: { members: true, posts: true } },
		},
	});

	return updatedChannel;
}

export async function deleteChannel(channelId: string, userId: string) {
	const channel = await prisma.channel.findUnique({
		where: { id: channelId, deletedAt: null },
	});

	if (!channel) {
		throw new NotFoundError("Channel");
	}

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { role: true },
	});

	if (user?.role !== "admin") {
		throw new ForbiddenError("Only admins can delete channels");
	}

	await prisma.channel.update({
		where: { id: channelId },
		data: { deletedAt: new Date() },
	});

	return { id: channelId };
}

export async function getChannelResources(slug: string, userId?: string) {
	const channel = await prisma.channel.findUnique({
		where: { slug, deletedAt: null },
	});

	if (!channel) {
		throw new NotFoundError("Channel");
	}

	if (channel.type === "private") {
		if (!userId) {
			throw new ForbiddenError("You are not a member of this private channel");
		}
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { role: true },
		});
		const membership = await prisma.channelMember.findUnique({
			where: {
				channelId_userId: {
					channelId: channel.id,
					userId,
				},
			},
		});
		if (!membership && user?.role !== "admin") {
			throw new ForbiddenError("You are not a member of this private channel");
		}
	}

	const resources = await prisma.resource.findMany({
		where: { channelId: channel.id, deletedAt: null },
		include: {
			user: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
		},
		orderBy: { createdAt: "desc" },
	});

	return resources;
}
