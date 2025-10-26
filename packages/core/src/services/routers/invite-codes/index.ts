import { BaseRouter } from "../../baseRouter";
import type {
	InviteCode,
	InviteCodeCreate,
	InviteCodeStatus,
	InviteCodeUpdate,
	InviteCodeUsageStats,
	InviteCodeValidateRequest,
	InviteCodeValidateResponse,
} from "../../types";

export class InviteCodesRouter extends BaseRouter {
	async getAll(
		skip: number = 0,
		limit: number = 100,
		status?: InviteCodeStatus,
		created_by?: string,
	): Promise<InviteCode[]> {
		const params = new URLSearchParams({
			skip: skip.toString(),
			limit: limit.toString(),
		});

		if (status) params.append("status", status);
		if (created_by) params.append("created_by", created_by);

		return this.client.get<InviteCode[]>(`invite-codes/?${params.toString()}`);
	}

	async getById(inviteCodeId: string): Promise<InviteCode> {
		return this.client.get<InviteCode>(`invite-codes/${inviteCodeId}`);
	}

	async getByChannelId(
		channelId: string,
		skip: number = 0,
		limit: number = 100,
	): Promise<InviteCode[]> {
		const params = new URLSearchParams({
			skip: skip.toString(),
			limit: limit.toString(),
		});

		return this.client.get<InviteCode[]>(
			`invite-codes/channel/${channelId}?${params.toString()}`,
		);
	}

	async create(data: InviteCodeCreate): Promise<InviteCode> {
		return this.client.post<InviteCode>("invite-codes/", data);
	}

	async update(
		inviteCodeId: string,
		data: InviteCodeUpdate,
	): Promise<InviteCode> {
		return this.client.put<InviteCode>(`invite-codes/${inviteCodeId}`, data);
	}

	async deactivate(inviteCodeId: string): Promise<InviteCode> {
		return this.client.post<InviteCode>(
			`invite-codes/${inviteCodeId}/deactivate`,
		);
	}

	async delete(inviteCodeId: string): Promise<{ message: string }> {
		return this.client.delete<{ message: string }>(
			`invite-codes/${inviteCodeId}`,
		);
	}

	async validate(
		data: InviteCodeValidateRequest,
	): Promise<InviteCodeValidateResponse> {
		return this.client.post<InviteCodeValidateResponse>(
			"invite-codes/validate",
			data,
		);
	}

	async getUsageStats(inviteCodeId: string): Promise<InviteCodeUsageStats> {
		return this.client.get<InviteCodeUsageStats>(
			`invite-codes/${inviteCodeId}/stats`,
		);
	}
}
