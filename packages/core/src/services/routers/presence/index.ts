import { BaseRouter } from "../../../utils/baseRouter";
import type {
	ActiveUsersResponse,
	PresenceStats,
	TimeseriesResponse,
	UserPresenceResponse,
} from "./types";

export class PresenceRouter extends BaseRouter {
	/**
	 * Get overall presence statistics
	 */
	async getStats(): Promise<PresenceStats> {
		return this.client.get<PresenceStats>("presence/stats");
	}

	/**
	 * Get presence history for a specific user
	 */
	async getUserPresence(
		userId: string,
		limit: number = 100,
	): Promise<UserPresenceResponse> {
		const params = new URLSearchParams({
			limit: limit.toString(),
		});
		return this.client.get<UserPresenceResponse>(
			`presence/user/${userId}?${params.toString()}`,
		);
	}

	/**
	 * Get presence data aggregated by time intervals for visualization
	 */
	async getTimeseries(
		startDate: string,
		endDate: string,
		interval: "hour" | "day" | "week" = "hour",
	): Promise<TimeseriesResponse> {
		const params = new URLSearchParams({
			start_date: startDate,
			end_date: endDate,
			interval,
		});
		return this.client.get<TimeseriesResponse>(
			`presence/timeseries?${params.toString()}`,
		);
	}

	/**
	 * Get currently active users
	 */
	async getActiveNow(): Promise<ActiveUsersResponse> {
		return this.client.get<ActiveUsersResponse>("presence/active-now");
	}
}
