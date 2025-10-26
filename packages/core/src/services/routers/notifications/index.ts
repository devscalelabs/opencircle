import type { Hooks } from "ky";
import ky from "ky";
import type { Notification } from "../../types";

export class NotificationsRouter {
	private baseUrl: string;
	private hooks?: Hooks;

	constructor(baseUrl: string, hooks?: Hooks) {
		this.baseUrl = baseUrl;
		this.hooks = hooks;
	}

	/**
	 * Get all notifications for the current user
	 */
	async getNotifications(
		skip: number = 0,
		limit: number = 100,
	): Promise<Notification[]> {
		const client = this.hooks ? ky.extend({ hooks: this.hooks }) : ky;
		return client
			.get(`${this.baseUrl}/notifications/`, {
				searchParams: {
					skip,
					limit,
				},
			})
			.json<Notification[]>();
	}

	/**
	 * Mark a notification as read
	 */
	async markAsRead(notificationId: string): Promise<Notification> {
		const client = this.hooks ? ky.extend({ hooks: this.hooks }) : ky;
		return client
			.post(`${this.baseUrl}/notifications/${notificationId}/read`)
			.json<Notification>();
	}
}
