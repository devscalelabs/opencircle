import { BaseRouter } from "../../../utils/baseRouter";
import type {
	Broadcast,
	BroadcastCreate,
	BroadcastSendTest,
	BroadcastUpdate,
} from "./types";

export class BroadcastsRouter extends BaseRouter {
	async getAll(skip: number = 0, limit: number = 100): Promise<Broadcast[]> {
		const params = new URLSearchParams({
			skip: skip.toString(),
			limit: limit.toString(),
		});
		return this.client.get<Broadcast[]>(`broadcasts/?${params.toString()}`);
	}

	async getById(broadcastId: string): Promise<Broadcast> {
		return this.client.get<Broadcast>(`broadcasts/${broadcastId}`);
	}

	async create(data: BroadcastCreate): Promise<Broadcast> {
		return this.client.post<Broadcast>("broadcasts/", data);
	}

	async update(broadcastId: string, data: BroadcastUpdate): Promise<Broadcast> {
		return this.client.put<Broadcast>(`broadcasts/${broadcastId}`, data);
	}

	async delete(broadcastId: string): Promise<{ message: string }> {
		return this.client.delete<{ message: string }>(`broadcasts/${broadcastId}`);
	}

	async sendTest(
		broadcastId: string,
		data: BroadcastSendTest,
	): Promise<{ message: string }> {
		return this.client.post<{ message: string }>(
			`broadcasts/${broadcastId}/send-test`,
			data,
		);
	}

	async send(broadcastId: string): Promise<{ message: string }> {
		return this.client.post<{ message: string }>(
			`broadcasts/${broadcastId}/send`,
			{},
		);
	}
}

export * from "./types";
