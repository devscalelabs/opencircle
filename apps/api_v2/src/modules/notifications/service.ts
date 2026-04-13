import { prisma } from "../../utils/prisma";
import { NotFoundError } from "../../exceptions";
import type { ListNotificationsQuery } from "./schema";

export async function listNotifications(
	userId: string,
	query: ListNotificationsQuery,
) {
	const { page, limit } = query;
	const skip = (page - 1) * limit;

	const where = {
		recipientId: userId,
		deletedAt: null,
	};

	const [items, total] = await Promise.all([
		prisma.notification.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
			include: {
				sender: {
					select: { id: true, username: true, name: true, avatarUrl: true },
				},
			},
		}),
		prisma.notification.count({ where }),
	]);

	return { items, total, page, limit };
}

export async function markAsRead(notificationId: string, userId: string) {
	const notification = await prisma.notification.findFirst({
		where: { id: notificationId, recipientId: userId, deletedAt: null },
	});

	if (!notification) {
		throw new NotFoundError("Notification");
	}

	return prisma.notification.update({
		where: { id: notificationId },
		data: { isRead: true },
	});
}
