import { prisma } from "../../utils/prisma";
import { NotFoundError } from "../../exceptions";

export async function getSessions(userId: string) {
	const sessions = await prisma.refreshToken.findMany({
		where: {
			userId,
			status: "active",
		},
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			deviceName: true,
			deviceType: true,
			browser: true,
			os: true,
			ipAddress: true,
			lastUsedAt: true,
			createdAt: true,
		},
	});

	return sessions.map((session) => ({
		id: session.id,
		device_name: session.deviceName,
		device_type: session.deviceType,
		browser: session.browser,
		os: session.os,
		ip_address: session.ipAddress,
		last_used_at: session.lastUsedAt,
		created_at: session.createdAt,
	}));
}

export async function revokeSession(sessionId: string, userId: string) {
	const token = await prisma.refreshToken.findUnique({
		where: { id: sessionId },
	});

	if (!token) {
		throw new NotFoundError("Session");
	}

	if (token.userId !== userId) {
		throw new NotFoundError("Session");
	}

	if (token.status !== "active") {
		throw new NotFoundError("Session");
	}

	await prisma.refreshToken.update({
		where: { id: sessionId },
		data: { status: "revoked" },
	});

	return { success: true };
}
