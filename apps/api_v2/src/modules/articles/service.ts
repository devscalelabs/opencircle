import { prisma } from "../../utils/prisma";
import { NotFoundError, ForbiddenError } from "../../exceptions";
import type {
	ArticleCreateInput,
	ArticleUpdateInput,
	ListArticlesQuery,
} from "./schema";

export async function createArticle(userId: string, data: ArticleCreateInput) {
	return prisma.post.create({
		data: {
			title: data.title,
			content: data.content,
			type: "article",
			userId,
			channelId: data.channelId,
		},
		include: {
			user: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
			channel: { select: { id: true, name: true, slug: true } },
		},
	});
}

export async function getArticle(id: string) {
	const article = await prisma.post.findUnique({
		where: { id, type: "article", deletedAt: null },
		include: {
			user: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
			channel: { select: { id: true, name: true, slug: true } },
			medias: { where: { deletedAt: null } },
			reactions: {
				where: { deletedAt: null },
				include: {
					user: {
						select: { id: true, username: true, name: true, avatarUrl: true },
					},
				},
			},
		},
	});

	if (!article) {
		throw new NotFoundError("Article");
	}

	return article;
}

export async function listArticles(query: ListArticlesQuery) {
	const { page, limit, userId } = query;
	const skip = (page - 1) * limit;

	const where = {
		type: "article" as const,
		deletedAt: null,
		...(userId && { userId }),
	};

	const [items, total] = await Promise.all([
		prisma.post.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
			include: {
				user: {
					select: { id: true, username: true, name: true, avatarUrl: true },
				},
				channel: { select: { id: true, name: true, slug: true } },
			},
		}),
		prisma.post.count({ where }),
	]);

	return { items, total, page, limit };
}

export async function updateArticle(
	id: string,
	userId: string,
	role: string,
	data: ArticleUpdateInput,
) {
	const article = await prisma.post.findUnique({
		where: { id, type: "article", deletedAt: null },
	});

	if (!article) {
		throw new NotFoundError("Article");
	}

	if (article.userId !== userId && role !== "admin") {
		throw new ForbiddenError("You can only update your own articles");
	}

	return prisma.post.update({
		where: { id },
		data,
		include: {
			user: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
			channel: { select: { id: true, name: true, slug: true } },
		},
	});
}

export async function deleteArticle(id: string, userId: string, role: string) {
	const article = await prisma.post.findUnique({
		where: { id, type: "article", deletedAt: null },
	});

	if (!article) {
		throw new NotFoundError("Article");
	}

	if (article.userId !== userId && role !== "admin") {
		throw new ForbiddenError("You can only delete your own articles");
	}

	await prisma.post.update({
		where: { id },
		data: { deletedAt: new Date() },
	});

	return { deleted: true };
}
