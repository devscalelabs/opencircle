import { prisma } from "../../utils/prisma";
import { NotFoundError, BadRequestError } from "../../exceptions";
import { createBroadcastJob } from "../../utils/queue";
import { sendNotificationEmail } from "../../utils/email";
import type {
	BroadcastCreateInput,
	BroadcastUpdateInput,
	ListBroadcastsQuery,
} from "./schema";

export async function createBroadcast(
	data: BroadcastCreateInput,
	userId: string,
) {
	if (data.recipientType === "channel_members" && !data.channelId) {
		throw new BadRequestError(
			"channelId is required when recipientType is channel_members",
		);
	}

	return prisma.broadcast.create({
		data: {
			subject: data.subject,
			content: data.content,
			recipientType: data.recipientType,
			testEmail: data.testEmail,
			channelId: data.channelId,
			createdBy: userId,
		},
	});
}

export async function listBroadcasts(query: ListBroadcastsQuery) {
	const { page, limit } = query;
	const skip = (page - 1) * limit;

	const where = { deletedAt: null };

	const [items, total] = await Promise.all([
		prisma.broadcast.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
			include: {
				creator: {
					select: { id: true, username: true, name: true, avatarUrl: true },
				},
			},
		}),
		prisma.broadcast.count({ where }),
	]);

	return { items, total, page, limit };
}

export async function getBroadcast(id: string) {
	const broadcast = await prisma.broadcast.findUnique({
		where: { id, deletedAt: null },
		include: {
			creator: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
		},
	});

	if (!broadcast) {
		throw new NotFoundError("Broadcast");
	}

	return broadcast;
}

export async function updateBroadcast(id: string, data: BroadcastUpdateInput) {
	const broadcast = await prisma.broadcast.findUnique({
		where: { id, deletedAt: null },
	});

	if (!broadcast) {
		throw new NotFoundError("Broadcast");
	}

	if (broadcast.status !== "draft") {
		throw new BadRequestError("Only draft broadcasts can be updated");
	}

	if (
		data.recipientType === "channel_members" &&
		!data.channelId &&
		!broadcast.channelId
	) {
		throw new BadRequestError(
			"channelId is required when recipientType is channel_members",
		);
	}

	return prisma.broadcast.update({
		where: { id },
		data,
	});
}

export async function deleteBroadcast(id: string) {
	const broadcast = await prisma.broadcast.findUnique({
		where: { id, deletedAt: null },
	});

	if (!broadcast) {
		throw new NotFoundError("Broadcast");
	}

	return prisma.broadcast.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
}

export async function sendTestBroadcast(id: string, email: string) {
	const broadcast = await prisma.broadcast.findUnique({
		where: { id, deletedAt: null },
	});

	if (!broadcast) {
		throw new NotFoundError("Broadcast");
	}

	await sendNotificationEmail(email, broadcast.subject, broadcast.content);

	return { sent: true, email };
}

export async function sendBroadcast(id: string) {
	const broadcast = await prisma.broadcast.findUnique({
		where: { id, deletedAt: null },
	});

	if (!broadcast) {
		throw new NotFoundError("Broadcast");
	}

	if (broadcast.status !== "draft") {
		throw new BadRequestError("Broadcast must be in draft status to send");
	}

	await prisma.broadcast.update({
		where: { id },
		data: { status: "sending" },
	});

	let recipients: { userId: string | null; email: string }[] = [];

	if (broadcast.recipientType === "all_users") {
		const users = await prisma.user.findMany({
			where: { isActive: true, deletedAt: null },
			select: { id: true, email: true },
		});
		recipients = users.map((u) => ({ userId: u.id, email: u.email }));
	} else if (
		broadcast.recipientType === "channel_members" &&
		broadcast.channelId
	) {
		const members = await prisma.channelMember.findMany({
			where: { channelId: broadcast.channelId, deletedAt: null },
			include: {
				user: {
					select: { id: true, email: true },
				},
			},
		});
		recipients = members.map((m) => ({
			userId: m.user.id,
			email: m.user.email,
		}));
	}

	await prisma.broadcastRecipient.createMany({
		data: recipients.map((r) => ({
			broadcastId: id,
			userId: r.userId,
			email: r.email,
		})),
	});

	await createBroadcastJob({ broadcastId: id });

	return { queued: true, recipientCount: recipients.length };
}
