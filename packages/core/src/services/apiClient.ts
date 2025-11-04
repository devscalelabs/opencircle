import type { Hooks } from "ky";
import ky from "ky";

export class ApiClient {
	private client: typeof ky;

	constructor(baseUrl: string, hooks?: Hooks) {
		this.client = ky.create({ prefixUrl: baseUrl, hooks });
	}

	async get<T>(url: string): Promise<T> {
		return this.client.get(url).json<T>();
	}

	async post<T>(url: string, data?: any): Promise<T> {
		if (data instanceof FormData) {
			return this.client.post(url, { body: data }).json<T>();
		}
		return this.client.post(url, { json: data }).json<T>();
	}

	async postWithFiles<T>(url: string, data: any, files?: File[]): Promise<T> {
		const formData = new FormData();

		// Add JSON data as a field
		formData.append("post", JSON.stringify(data));

		// Add files if provided
		if (files) {
			files.forEach((file) => {
				formData.append("files", file);
			});
		}

		return this.client.post(url, { body: formData }).json<T>();
	}

	async put<T>(url: string, data?: any): Promise<T> {
		return this.client.put(url, { json: data }).json<T>();
	}

	async putWithFiles<T>(url: string, data: any, file?: File): Promise<T> {
		const formData = new FormData();

		// Add JSON data as a field
		formData.append("user", JSON.stringify(data));

		// Add file if provided
		if (file) {
			formData.append("file", file);
		}

		return this.client.put(url, { body: formData }).json<T>();
	}

	async delete<T>(url: string): Promise<T> {
		return this.client.delete(url).json<T>();
	}
}
