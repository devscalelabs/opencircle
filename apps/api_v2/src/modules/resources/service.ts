import { prisma } from "../../utils/prisma";
import { NotFoundError, ForbiddenError } from "../../exceptions";
import type {
	ResourceCreateInput,
	ResourceUpdateInput,
	ListResourcesQuery,
} from "./schema";

export async function createResource(
	data: ResourceCreateInput,
	userId: string,
) {
	const channel = await prisma.channel.findUnique({
		where: { id: data.channelId },
	});

	if (!channel) {
		throw new NotFoundError("Channel");
	}

	if (channel.type === "private") {
		const membership = await prisma.channelMember.findUnique({
			where: {
				channelId_userId: {
					channelId: channel.id,
					userId,
				},
			},
		});
		if (!membership) {
			throw new ForbiddenError("Access denied to private channel");
		}
	}

	return prisma.resource.create({
		data: {
			url: data.url,
			description: data.description,
			userId,
			channelId: data.channelId,
		},
		include: {
			user: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
			channel: true,
		},
	});
}

export async function getResource(id: string, userId?: string) {
	const resource = await prisma.resource.findUnique({
		where: { id, deletedAt: null },
		include: {
			user: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
			channel: true,
		},
	});

	if (!resource) {
		throw new NotFoundError("Resource");
	}

	if (resource.channel.type === "private") {
		if (!userId) {
			throw new ForbiddenError("Access denied to private channel");
		}
		const membership = await prisma.channelMember.findUnique({
			where: {
				channelId_userId: {
					channelId: resource.channelId,
					userId,
				},
			},
		});
		if (!membership) {
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { role: true },
			});
			if (user?.role !== "admin") {
				throw new ForbiddenError("Access denied to private channel");
			}
		}
	}

	return resource;
}

export async function listResources(
	query: ListResourcesQuery,
	userId?: string,
) {
	const { page, limit, channelId, userId: filterUserId } = query;
	const skip = (page - 1) * limit;

	const where: Record<string, unknown> = {
		deletedAt: null,
	};

	if (channelId) {
		const channel = await prisma.channel.findUnique({
			where: { id: channelId },
		});
		if (!channel) {
			throw new NotFoundError("Channel");
		}
		if (channel.type === "private") {
			if (!userId) {
				throw new ForbiddenError("Access denied to private channel");
			}
			const membership = await prisma.channelMember.findUnique({
				where: {
					channelId_userId: {
						channelId: channel.id,
						userId,
					},
				},
			});
			if (!membership) {
				const user = await prisma.user.findUnique({
					where: { id: userId },
					select: { role: true },
				});
				if (user?.role !== "admin") {
					throw new ForbiddenError("Access denied to private channel");
				}
			}
		}
		where.channelId = channelId;
	}

	if (filterUserId) {
		where.userId = filterUserId;
	}

	const [items, total] = await Promise.all([
		prisma.resource.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
			include: {
				user: {
					select: { id: true, username: true, name: true, avatarUrl: true },
				},
				channel: true,
			},
		}),
		prisma.resource.count({ where }),
	]);

	return { items, total, page, limit };
}

export async function updateResource(
	id: string,
	data: ResourceUpdateInput,
	userId: string,
) {
	const resource = await prisma.resource.findUnique({
		where: { id, deletedAt: null },
	});

	if (!resource) {
		throw new NotFoundError("Resource");
	}

	if (resource.userId !== userId) {
		throw new ForbiddenError("Can only update your own resources");
	}

	return prisma.resource.update({
		where: { id },
		data,
		include: {
			user: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
			channel: true,
		},
	});
}

export async function deleteResource(id: string, userId: string) {
	const resource = await prisma.resource.findUnique({
		where: { id, deletedAt: null },
	});

	if (!resource) {
		throw new NotFoundError("Resource");
	}

	if (resource.userId !== userId) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { role: true },
		});
		if (user?.role !== "admin") {
			throw new ForbiddenError("Can only delete your own resources");
		}
	}

	await prisma.resource.update({
		where: { id },
		data: { deletedAt: new Date() },
	});

	return { id };
}
