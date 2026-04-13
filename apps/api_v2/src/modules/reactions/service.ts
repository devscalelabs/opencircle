import { prisma } from "../../utils/prisma";
import { NotFoundError } from "../../exceptions";
import { createNotificationJob } from "../../utils/queue";
import type { ReactionCreateInput, DeleteReactionQuery } from "./schema";

export async function toggleReaction(
	userId: string,
	data: ReactionCreateInput,
) {
	const existing = await prisma.reaction.findFirst({
		where: {
			userId,
			postId: data.postId,
			emoji: data.emoji,
			deletedAt: null,
		},
	});

	if (existing) {
		await prisma.reaction.update({
			where: { id: existing.id },
			data: { deletedAt: new Date() },
		});
		return { reaction: existing, removed: true };
	}

	const reaction = await prisma.reaction.create({
		data: {
			userId,
			postId: data.postId,
			emoji: data.emoji,
		},
		include: {
			post: { select: { userId: true } },
		},
	});

	if (data.emoji === "like" && reaction.post.userId !== userId) {
		await createNotificationJob({
			recipientId: reaction.post.userId,
			senderId: userId,
			type: "like",
			postId: data.postId,
		});
	}

	return { reaction, removed: false };
}

export async function getReactionsByPost(postId: string) {
	const post = await prisma.post.findUnique({
		where: { id: postId, deletedAt: null },
	});

	if (!post) {
		throw new NotFoundError("Post");
	}

	const reactions = await prisma.reaction.findMany({
		where: { postId, deletedAt: null },
		include: {
			user: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
		},
		orderBy: { createdAt: "desc" },
	});

	const grouped = reactions.reduce(
		(acc, reaction) => {
			const emoji = reaction.emoji;
			if (!acc[emoji]) {
				acc[emoji] = { emoji, count: 0, users: [] };
			}
			acc[emoji].count += 1;
			acc[emoji].users.push(reaction.user);
			return acc;
		},
		{} as Record<
			string,
			{
				emoji: string;
				count: number;
				users: Array<{
					id: string;
					username: string;
					name: string | null;
					avatarUrl: string | null;
				}>;
			}
		>,
	);

	return Object.values(grouped);
}

export async function deleteReaction(
	userId: string,
	query: DeleteReactionQuery,
) {
	const reaction = await prisma.reaction.findFirst({
		where: {
			userId,
			postId: query.postId,
			emoji: query.emoji,
			deletedAt: null,
		},
	});

	if (!reaction) {
		throw new NotFoundError("Reaction");
	}

	await prisma.reaction.update({
		where: { id: reaction.id },
		data: { deletedAt: new Date() },
	});

	return { deleted: true };
}
