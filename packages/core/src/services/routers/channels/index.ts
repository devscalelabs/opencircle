import { BaseRouter } from "../../baseRouter";
import type { Channel, ChannelCreate, ChannelUpdate } from "../../types";

export class ChannelsRouter extends BaseRouter {
	async getAll(skip: number = 0, limit: number = 100): Promise<Channel[]> {
		return this.client.get<Channel[]>(`channels/?skip=${skip}&limit=${limit}`);
	}

	async getById(channelId: string): Promise<Channel> {
		return this.client.get<Channel>(`channels/${channelId}`);
	}

	async create(data: ChannelCreate): Promise<Channel> {
		return this.client.post<Channel>("channels/", data);
	}

	async update(channelId: string, data: ChannelUpdate): Promise<Channel> {
		return this.client.put<Channel>(`channels/${channelId}`, data);
	}

	async delete(channelId: string): Promise<{ message: string }> {
		return this.client.delete<{ message: string }>(`channels/${channelId}`);
	}
}
