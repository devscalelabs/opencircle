import { prisma } from "../../utils/prisma";
import type { TimeseriesQuery } from "./schema";

export async function getStats() {
	const totalSessions = await prisma.userPresence.count({
		where: { deletedAt: null },
	});

	const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

	const activeSessions = await prisma.userPresence.count({
		where: {
			disconnectedAt: null,
			updatedAt: { gte: thirtyMinutesAgo },
			deletedAt: null,
		},
	});

	const avgResult = await prisma.userPresence.aggregate({
		where: {
			durationSeconds: { not: null },
			deletedAt: null,
		},
		_avg: { durationSeconds: true },
	});

	const uniqueUsers = await prisma.userPresence.groupBy({
		by: ["userId"],
		where: { deletedAt: null },
		_count: true,
	});

	return {
		totalSessions,
		activeSessions,
		averageDurationSeconds:
			Math.round((avgResult._avg.durationSeconds ?? 0) * 100) / 100,
		uniqueUsers: uniqueUsers.length,
	};
}

export async function getUserPresence(userId: string, limit = 100) {
	const presences = await prisma.userPresence.findMany({
		where: {
			userId,
			deletedAt: null,
		},
		orderBy: { connectedAt: "desc" },
		take: limit,
	});

	return {
		userId,
		totalSessions: presences.length,
		sessions: presences.map((p) => ({
			id: p.id,
			connectionId: p.connectionId,
			connectedAt: p.connectedAt,
			disconnectedAt: p.disconnectedAt,
			durationSeconds: p.durationSeconds,
		})),
	};
}

export async function getTimeseries(query: TimeseriesQuery) {
	const { interval, from, to } = query;

	const where: Record<string, unknown> = { deletedAt: null };

	if (from) {
		where.connectedAt = {
			...((where.connectedAt as Record<string, unknown>) ?? {}),
			gte: new Date(from),
		};
	}
	if (to) {
		where.connectedAt = {
			...((where.connectedAt as Record<string, unknown>) ?? {}),
			lte: new Date(to),
		};
	}

	const presences = await prisma.userPresence.findMany({
		where,
		orderBy: { connectedAt: "asc" },
	});

	const buckets = new Map<
		string,
		{
			timestamp: string;
			sessionCount: number;
			uniqueUsers: Set<string>;
			totalDuration: number;
		}
	>();

	for (const presence of presences) {
		const connectedAt = new Date(presence.connectedAt);
		let bucket: Date;

		if (interval === "day") {
			bucket = new Date(
				connectedAt.getFullYear(),
				connectedAt.getMonth(),
				connectedAt.getDate(),
			);
		} else {
			bucket = new Date(
				connectedAt.getFullYear(),
				connectedAt.getMonth(),
				connectedAt.getDate(),
				connectedAt.getHours(),
			);
		}

		const bucketKey = bucket.toISOString();

		if (!buckets.has(bucketKey)) {
			buckets.set(bucketKey, {
				timestamp: bucketKey,
				sessionCount: 0,
				uniqueUsers: new Set(),
				totalDuration: 0,
			});
		}

		const entry = buckets.get(bucketKey)!;
		entry.sessionCount += 1;
		entry.uniqueUsers.add(presence.userId);
		if (presence.durationSeconds) {
			entry.totalDuration += presence.durationSeconds;
		}
	}

	const data = Array.from(buckets.values())
		.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
		.map((entry) => ({
			timestamp: entry.timestamp,
			sessionCount: entry.sessionCount,
			uniqueUsers: entry.uniqueUsers.size,
			totalDurationSeconds: Math.round(entry.totalDuration * 100) / 100,
			averageDurationSeconds:
				entry.sessionCount > 0
					? Math.round((entry.totalDuration / entry.sessionCount) * 100) / 100
					: 0,
		}));

	return {
		interval,
		from: from ?? null,
		to: to ?? null,
		data,
	};
}

export async function cleanup() {
	const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

	const staleRecords = await prisma.userPresence.findMany({
		where: {
			disconnectedAt: null,
			updatedAt: { lt: oneHourAgo },
			deletedAt: null,
		},
	});

	for (const record of staleRecords) {
		const connectedAt = new Date(record.connectedAt);
		const durationSeconds =
			(oneHourAgo.getTime() - connectedAt.getTime()) / 1000;

		await prisma.userPresence.update({
			where: { id: record.id },
			data: {
				disconnectedAt: oneHourAgo,
				durationSeconds,
			},
		});
	}

	return {
		cleanedUp: staleRecords.length,
		message: `Cleaned up ${staleRecords.length} stale presence records`,
	};
}

export async function getActiveNow() {
	const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

	const presences = await prisma.userPresence.findMany({
		where: {
			disconnectedAt: null,
			updatedAt: { gte: thirtyMinutesAgo },
			deletedAt: null,
		},
		include: {
			user: {
				select: { id: true, username: true, name: true },
			},
		},
	});

	const now = new Date();

	return {
		activeCount: presences.length,
		activeUsers: presences.map((p) => ({
			userId: p.userId,
			username: p.user.username,
			name: p.user.name,
			connectionId: p.connectionId,
			connectedAt: p.connectedAt,
			durationSeconds: Math.max(
				0,
				(now.getTime() - new Date(p.connectedAt).getTime()) / 1000,
			),
		})),
	};
}
