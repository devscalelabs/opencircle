import { prisma } from "../../utils/prisma";
import { NotFoundError, ForbiddenError } from "../../exceptions";
import type {
	PostCreateInput,
	PostUpdateInput,
	ListPostsQuery,
} from "./schema";
import { uploadFile } from "../../utils/storage";

export async function createPost(data: PostCreateInput, userId: string) {
	if (data.channelId) {
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
			if (!membership && channel.type === "private") {
				throw new ForbiddenError(
					"You are not a member of this private channel",
				);
			}
		}
	}

	const post = await prisma.post.create({
		data: {
			title: data.title,
			content: data.content,
			type: data.type,
			userId,
			channelId: data.channelId,
			parentId: data.parentId,
			isPinned: data.isPinned,
		},
		include: {
			user: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
			medias: true,
			reactions: true,
			_count: { select: { reactions: true } },
		},
	});

	return post;
}

export async function createPostWithFiles(
	data: {
		title?: string;
		content: string;
		type: string;
		channelId?: string;
		parentId?: string;
		isPinned: boolean;
	},
	files: { name: string; type: string; data: Buffer }[] | undefined,
	userId: string,
) {
	if (data.channelId) {
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
				throw new ForbiddenError(
					"You are not a member of this private channel",
				);
			}
		}
	}

	const post = await prisma.post.create({
		data: {
			title: data.title,
			content: data.content,
			type: data.type as "post" | "comment" | "article" | "poll",
			userId,
			channelId: data.channelId,
			parentId: data.parentId,
			isPinned: data.isPinned,
		},
		include: {
			user: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
			medias: true,
			reactions: true,
			_count: { select: { reactions: true } },
		},
	});

	if (files && files.length > 0) {
		const mediaCreates = [];
		for (const file of files) {
			const url = await uploadFile(file, "posts");
			mediaCreates.push({
				url,
				postId: post.id,
				userId,
			});
		}
		await prisma.media.createMany({ data: mediaCreates });
	}

	const postWithMedias = await prisma.post.findUnique({
		where: { id: post.id },
		include: {
			user: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
			medias: true,
			reactions: true,
			_count: { select: { reactions: true } },
		},
	});

	return postWithMedias!;
}

export async function getPost(postId: string, userId?: string) {
	const post = await prisma.post.findUnique({
		where: { id: postId, deletedAt: null },
		include: {
			user: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
			medias: true,
			reactions: true,
			_count: { select: { reactions: true } },
		},
	});

	if (!post) {
		throw new NotFoundError("Post");
	}

	if (post.channelId) {
		const channel = await prisma.channel.findUnique({
			where: { id: post.channelId },
		});
		if (channel?.type === "private") {
			if (!userId) {
				throw new ForbiddenError(
					"You are not a member of this private channel",
				);
			}
			const requestingUser = await prisma.user.findUnique({
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
			if (!membership && requestingUser?.role !== "admin") {
				throw new ForbiddenError(
					"You are not a member of this private channel",
				);
			}
		}
	}

	return post;
}

export async function listPosts(query: ListPostsQuery, userId?: string) {
	const where: Record<string, unknown> = {
		deletedAt: null,
	};

	if (query.userId) {
		where.userId = query.userId;
	}

	if (query.postType) {
		where.type = query.postType;
	}

	if (query.parentId) {
		where.parentId = query.parentId;
	}

	if (query.channelSlug) {
		const channel = await prisma.channel.findUnique({
			where: { slug: query.channelSlug },
		});
		if (!channel) {
			throw new NotFoundError("Channel");
		}
		if (channel.type === "private") {
			if (!userId) {
				throw new ForbiddenError(
					"You are not a member of this private channel",
				);
			}
			const membership = await prisma.channelMember.findUnique({
				where: {
					channelId_userId: {
						channelId: channel.id,
						userId,
					},
				},
			});
			const requestingUser = await prisma.user.findUnique({
				where: { id: userId },
				select: { role: true },
			});
			if (!membership && requestingUser?.role !== "admin") {
				throw new ForbiddenError(
					"You are not a member of this private channel",
				);
			}
		}
		where.channelId = channel.id;
	}

	const [posts, total] = await Promise.all([
		prisma.post.findMany({
			where,
			skip: (query.page - 1) * query.limit,
			take: query.limit,
			orderBy: { createdAt: "desc" },
			include: {
				user: {
					select: { id: true, username: true, name: true, avatarUrl: true },
				},
				medias: true,
				reactions: true,
				_count: { select: { reactions: true } },
			},
		}),
		prisma.post.count({ where }),
	]);

	return {
		data: posts,
		meta: {
			page: query.page,
			limit: query.limit,
			total,
			total_pages: Math.ceil(total / query.limit),
		},
	};
}

export async function updatePost(
	postId: string,
	data: PostUpdateInput,
	userId: string,
) {
	const post = await prisma.post.findUnique({
		where: { id: postId, deletedAt: null },
	});

	if (!post) {
		throw new NotFoundError("Post");
	}

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { role: true },
	});

	if (post.userId !== userId && user?.role !== "admin") {
		throw new ForbiddenError("You can only update your own posts");
	}

	const updatedPost = await prisma.post.update({
		where: { id: postId },
		data: {
			...(data.title !== undefined && { title: data.title }),
			...(data.content !== undefined && { content: data.content }),
			...(data.type !== undefined && { type: data.type }),
			...(data.isPinned !== undefined && { isPinned: data.isPinned }),
		},
		include: {
			user: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
			medias: true,
			reactions: true,
			_count: { select: { reactions: true } },
		},
	});

	return updatedPost;
}

export async function deletePost(postId: string, userId?: string) {
	const post = await prisma.post.findUnique({
		where: { id: postId, deletedAt: null },
	});

	if (!post) {
		throw new NotFoundError("Post");
	}

	if (post.channelId) {
		const channel = await prisma.channel.findUnique({
			where: { id: post.channelId },
		});
		if (channel?.type === "private") {
			if (!userId) {
				throw new ForbiddenError(
					"You are not a member of this private channel",
				);
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
				throw new ForbiddenError(
					"You are not a member of this private channel",
				);
			}
		}
	}

	await prisma.post.update({
		where: { id: postId },
		data: { deletedAt: new Date() },
	});

	return { id: postId };
}
