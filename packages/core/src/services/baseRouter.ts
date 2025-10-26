import type { Hooks } from "ky";
import { ApiClient } from "./apiClient";

export abstract class BaseRouter {
	protected client: ApiClient;

	constructor(baseUrl: string, hooks?: Hooks) {
		this.client = new ApiClient(baseUrl, hooks);
	}
}
