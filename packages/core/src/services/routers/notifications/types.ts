import type { User } from "../auth/types";

export const NotificationType = {
	MENTION: "mention",
	LIKE: "like",
	REPLY: "reply",
} as const;

export type NotificationType =
	(typeof NotificationType)[keyof typeof NotificationType];

export const NotificationFrequency = {
	IMMEDIATE: "immediate",
	DAILY: "daily",
	WEEKLY: "weekly",
	NONE: "none",
} as const;

export type NotificationFrequency =
	(typeof NotificationFrequency)[keyof typeof NotificationFrequency];

export interface Notification {
	id: string;
	recipient_id: string;
	sender_id: string;
	type: NotificationType;
	data?: {
		content: string;
		post_id?: string;
		original_post_id?: string;
	};
	is_read: boolean;
	recipient: User;
	sender: User;
	created_at: string;
	updated_at: string;
}

export interface NotificationPreferences {
	id: string;
	user_id: string;
	mention_email: NotificationFrequency;
	like_email: NotificationFrequency;
	reply_email: NotificationFrequency;
	created_at: string;
	updated_at: string;
}

export interface NotificationPreferencesUpdate {
	mention_email?: NotificationFrequency;
	like_email?: NotificationFrequency;
	reply_email?: NotificationFrequency;
}
