import { prisma } from "../../utils/prisma";
import type { NotificationPreferencesUpdate } from "./schema";

export async function getPreferences(userId: string) {
	const prefs = await prisma.notificationPreferences.findUnique({
		where: { userId },
	});

	if (!prefs) {
		return prisma.notificationPreferences.create({
			data: { userId },
		});
	}

	return prefs;
}

export async function updatePreferences(
	userId: string,
	data: NotificationPreferencesUpdate,
) {
	const prefs = await prisma.notificationPreferences.findUnique({
		where: { userId },
	});

	if (!prefs) {
		return prisma.notificationPreferences.create({
			data: {
				userId,
				...data,
			},
		});
	}

	return prisma.notificationPreferences.update({
		where: { userId },
		data,
	});
}
