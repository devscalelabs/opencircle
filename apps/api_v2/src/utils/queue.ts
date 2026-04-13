import { Queue, Worker } from "bullmq";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const connection = {
	url: REDIS_URL,
};

export const notificationQueue = new Queue("notifications", { connection });
export const broadcastQueue = new Queue("broadcasts", { connection });

export function createNotificationJob(data: {
	recipientId: string;
	senderId: string;
	type: string;
	postId?: string;
	message?: string;
}): Promise<string> {
	return notificationQueue
		.add("create-notification", data, {
			attempts: 3,
			backoff: { type: "exponential", delay: 1000 },
		})
		.then((job) => job.id || "");
}

export function createBroadcastJob(data: {
	broadcastId: string;
}): Promise<string> {
	return broadcastQueue
		.add("send-broadcast", data, {
			attempts: 3,
			backoff: { type: "exponential", delay: 1000 },
		})
		.then((job) => job.id || "");
}

export { Worker, connection };
