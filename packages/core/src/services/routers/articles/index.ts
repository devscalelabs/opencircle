import { BaseRouter } from "../../baseRouter";
import type { Article, ArticleCreate, ArticleUpdate } from "../../types";

export class ArticlesRouter extends BaseRouter {
	async getAll(
		skip: number = 0,
		limit: number = 100,
		userId?: string,
	): Promise<Article[]> {
		const params = new URLSearchParams({
			skip: skip.toString(),
			limit: limit.toString(),
		});
		if (userId) params.append("user_id", userId);
		return this.client.get<Article[]>(`articles/?${params.toString()}`);
	}

	async getById(articleId: string): Promise<Article> {
		return this.client.get<Article>(`articles/${articleId}`);
	}

	async create(data: ArticleCreate): Promise<Article> {
		return this.client.post<Article>("articles/", data);
	}

	async update(articleId: string, data: ArticleUpdate): Promise<Article> {
		return this.client.put<Article>(`articles/${articleId}`, data);
	}

	async delete(articleId: string): Promise<{ message: string }> {
		return this.client.delete<{ message: string }>(`articles/${articleId}`);
	}
}
