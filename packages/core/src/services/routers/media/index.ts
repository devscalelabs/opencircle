import { BaseRouter } from "../../baseRouter";
import type { Media, MediaCreate, MediaUpdate } from "../../types";

export class MediaRouter extends BaseRouter {
	async getAll(
		skip: number = 0,
		limit: number = 100,
		postId?: string,
		userId?: string,
	): Promise<Media[]> {
		const params = new URLSearchParams({
			skip: skip.toString(),
			limit: limit.toString(),
		});
		if (postId) params.append("post_id", postId);
		if (userId) params.append("user_id", userId);
		return this.client.get<Media[]>(`medias/?${params.toString()}`);
	}

	async getById(mediaId: string): Promise<Media> {
		return this.client.get<Media>(`medias/${mediaId}`);
	}

	async create(data: MediaCreate): Promise<Media> {
		return this.client.post<Media>("medias/", data);
	}

	async update(mediaId: string, data: MediaUpdate): Promise<Media> {
		return this.client.put<Media>(`medias/${mediaId}`, data);
	}

	async delete(mediaId: string): Promise<{ message: string }> {
		return this.client.delete<{ message: string }>(`medias/${mediaId}`);
	}
}
