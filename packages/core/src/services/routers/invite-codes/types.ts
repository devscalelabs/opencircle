export const InviteCodeStatus = {
	ACTIVE: "active",
	USED: "used",
	EXPIRED: "expired",
} as const;

export type InviteCodeStatus =
	(typeof InviteCodeStatus)[keyof typeof InviteCodeStatus];

export interface InviteCode {
	id: string;
	code: string;
	max_uses: number;
	used_count: number;
	expires_at?: string;
	status: InviteCodeStatus;
	created_by: string;
	auto_join_channel_id?: string;
	created_at: string;
	updated_at: string;
}

export interface InviteCodeCreate {
	code?: string;
	max_uses?: number;
	expires_at?: string;
	auto_join_channel_id?: string;
	created_by: string;
}

export interface InviteCodeUpdate {
	max_uses?: number;
	expires_at?: string;
	auto_join_channel_id?: string;
	status?: InviteCodeStatus;
}

export interface InviteCodeUsageStats {
	code: string;
	max_uses: number;
	used_count: number;
	remaining_uses: number;
	status: InviteCodeStatus;
	expires_at?: string;
	used_by_users: Array<{
		id: string;
		username: string;
		email: string;
	}>;
}

export interface InviteCodeValidateRequest {
	code: string;
	user_id: string;
}

export interface InviteCodeValidateResponse {
	valid: boolean;
	invite_code?: InviteCode;
	message: string;
	auto_joined_channel: boolean;
	channel_id?: string;
}
