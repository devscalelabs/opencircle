import { prisma } from "../../utils/prisma";
import { NotFoundError } from "../../exceptions";
import type {
	MediaCreateInput,
	MediaUpdateInput,
	ListMediasQuery,
} from "./schema";

export async function createMedia(data: MediaCreateInput) {
	return prisma.media.create({
		data: {
			url: data.url,
			postId: data.postId,
			userId: data.userId,
		},
	});
}

export async function getMedia(id: string) {
	const media = await prisma.media.findUnique({
		where: { id, deletedAt: null },
		include: {
			post: true,
			user: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
		},
	});

	if (!media) {
		throw new NotFoundError("Media");
	}

	return media;
}

export async function listMedia(query: ListMediasQuery) {
	const { page, limit, postId, userId } = query;
	const skip = (page - 1) * limit;

	const where = {
		deletedAt: null,
		...(postId && { postId }),
		...(userId && { userId }),
	};

	const [items, total] = await Promise.all([
		prisma.media.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
			include: {
				user: {
					select: { id: true, username: true, name: true, avatarUrl: true },
				},
			},
		}),
		prisma.media.count({ where }),
	]);

	return { items, total, page, limit };
}

export async function updateMedia(id: string, data: MediaUpdateInput) {
	const media = await prisma.media.findUnique({
		where: { id, deletedAt: null },
	});

	if (!media) {
		throw new NotFoundError("Media");
	}

	return prisma.media.update({
		where: { id },
		data,
	});
}

export async function deleteMedia(id: string) {
	const media = await prisma.media.findUnique({
		where: { id, deletedAt: null },
	});

	if (!media) {
		throw new NotFoundError("Media");
	}

	return prisma.media.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
}
