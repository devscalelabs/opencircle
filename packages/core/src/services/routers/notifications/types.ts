import type { User } from "../auth/types";

export const NotificationType = {
	MENTION: "mention",
	LIKE: "like",
} as const;

export type NotificationType =
	(typeof NotificationType)[keyof typeof NotificationType];

export interface Notification {
	id: string;
	recipient_id: string;
	sender_id: string;
	type: NotificationType;
	data?: {
		content: string;
		post_id?: string;
	};
	is_read: boolean;
	recipient: User;
	sender: User;
	created_at: string;
	updated_at: string;
}
