import type { User } from "../auth/types";
import type { Channel } from "../channels/types";

export type BroadcastStatus = "draft" | "sending" | "sent" | "failed";
export type BroadcastRecipientType =
	| "all_users"
	| "test_email"
	| "channel_members";

export interface Broadcast {
	id: string;
	subject: string;
	content: string;
	recipient_type: BroadcastRecipientType;
	test_email?: string;
	channel_id?: string;
	channel?: Channel;
	status: BroadcastStatus;
	sent_at?: string;
	sent_count: number;
	failed_count: number;
	created_by: string;
	creator?: User;
	created_at: string;
	updated_at: string;
}

export interface BroadcastCreate {
	subject: string;
	content: string;
	recipient_type?: BroadcastRecipientType;
	test_email?: string;
	channel_id?: string;
}

export interface BroadcastUpdate {
	subject?: string;
	content?: string;
	recipient_type?: BroadcastRecipientType;
	test_email?: string;
	channel_id?: string;
}

export interface BroadcastSendTest {
	test_email: string;
}
