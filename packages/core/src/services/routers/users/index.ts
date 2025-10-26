import { BaseRouter } from "../../baseRouter";
import type {
	User,
	UserCreate,
	UserUpdate,
	UserUpdateWithFile,
} from "../../types";

export class UsersRouter extends BaseRouter {
	async getAll(
		skip: number = 0,
		limit: number = 100,
		query?: string,
	): Promise<User[]> {
		const params = new URLSearchParams({
			skip: skip.toString(),
			limit: limit.toString(),
		});
		if (query) params.append("query", query);
		return this.client.get<User[]>(`users/?${params.toString()}`);
	}

	async getById(userId: string): Promise<User> {
		return this.client.get<User>(`users/${userId}`);
	}

	async getByUsername(username: string): Promise<User> {
		return this.client.get<User>(`users/username/${username}`);
	}

	async create(data: UserCreate): Promise<User> {
		return this.client.post<User>("users/", data);
	}

	async update(userId: string, data: UserUpdate): Promise<User> {
		return this.client.put<User>(`users/${userId}`, data);
	}

	async updateWithFile(
		userId: string,
		data: UserUpdateWithFile,
		file?: File,
	): Promise<User> {
		return this.client.putWithFiles<User>(
			`users/${userId}/with-file`,
			data,
			file,
		);
	}

	async delete(userId: string): Promise<{ message: string }> {
		return this.client.delete<{ message: string }>(`users/${userId}`);
	}
}
