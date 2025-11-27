import { BaseRouter } from "../../../utils/baseRouter";
import type {
	Notification,
	NotificationPreferences,
	NotificationPreferencesUpdate,
} from "../../types";

export class NotificationsRouter extends BaseRouter {
	async getAll(skip: number = 0, limit: number = 100): Promise<Notification[]> {
		const params = new URLSearchParams({
			skip: skip.toString(),
			limit: limit.toString(),
		});
		return this.client.get<Notification[]>(
			`notifications?${params.toString()}`,
		);
	}

	async markAsRead(notificationId: string): Promise<Notification> {
		return this.client.post<Notification>(
			`notifications/${notificationId}/read`,
		);
	}

	async getPreferences(): Promise<NotificationPreferences> {
		return this.client.get<NotificationPreferences>(
			"notifications/preferences",
		);
	}

	async updatePreferences(
		data: NotificationPreferencesUpdate,
	): Promise<NotificationPreferences> {
		return this.client.put<NotificationPreferences>(
			"notifications/preferences",
			data,
		);
	}
}
