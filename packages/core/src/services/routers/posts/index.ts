import { BaseRouter } from "../../baseRouter";
import type { Post, PostCreate, PostUpdate } from "../../types";

export class PostsRouter extends BaseRouter {
	async getAll(
		skip: number = 0,
		limit: number = 100,
		userId?: string,
		postType?: string,
		parentId?: string,
		channelSlug?: string,
	): Promise<Post[]> {
		const params = new URLSearchParams({
			skip: skip.toString(),
			limit: limit.toString(),
		});
		if (userId) params.append("user_id", userId);
		if (postType) params.append("post_type", postType);
		if (parentId) params.append("parent_id", parentId);
		if (channelSlug) params.append("channel_slug", channelSlug);
		return this.client.get<Post[]>(`posts/?${params.toString()}`);
	}

	async getById(postId: string): Promise<Post> {
		return this.client.get<Post>(`posts/${postId}`);
	}

	async create(data: PostCreate): Promise<Post> {
		return this.client.post<Post>("posts/", data);
	}

	async createWithFiles(data: PostCreate, files?: File[]): Promise<Post> {
		return this.client.postWithFiles<Post>("posts/with-files/", data, files);
	}

	async update(postId: string, data: PostUpdate): Promise<Post> {
		return this.client.put<Post>(`posts/${postId}`, data);
	}

	async delete(postId: string): Promise<{ message: string }> {
		return this.client.delete<{ message: string }>(`posts/${postId}`);
	}
}
