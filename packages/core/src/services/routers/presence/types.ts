export interface PresenceStats {
	total_sessions: number;
	active_sessions: number;
	average_duration_seconds: number;
	unique_users: number;
}

export interface PresenceSession {
	id: string;
	connection_id: string;
	connected_at: string;
	disconnected_at: string | null;
	duration_seconds: number | null;
}

export interface UserPresenceResponse {
	user_id: string;
	total_sessions: number;
	sessions: PresenceSession[];
}

export interface ActiveUser {
	user_id: string;
	username: string;
	name: string;
	connection_id: string;
	connected_at: string;
	duration_seconds: number;
}

export interface ActiveUsersResponse {
	active_count: number;
	active_users: ActiveUser[];
}

export interface TimeseriesDataPoint {
	timestamp: string;
	session_count: number;
	unique_users: number;
	total_duration_seconds: number;
	average_duration_seconds: number;
}

export interface TimeseriesResponse {
	start_date: string;
	end_date: string;
	interval: "hour" | "day" | "week";
	data: TimeseriesDataPoint[];
}
