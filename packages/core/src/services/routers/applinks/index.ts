import { BaseRouter } from "../../../utils/baseRouter";
import type { AppLink, AppLinkCreate, AppLinkUpdate } from "./types";

export class AppLinksRouter extends BaseRouter {
	async getAll(): Promise<AppLink[]> {
		return this.client.get<AppLink[]>("applinks/");
	}

	async getById(appLinkId: string): Promise<AppLink> {
		return this.client.get<AppLink>(`applinks/${appLinkId}`);
	}

	async create(data: AppLinkCreate): Promise<AppLink> {
		return this.client.post<AppLink>("applinks/", data);
	}

	async update(appLinkId: string, data: AppLinkUpdate): Promise<AppLink> {
		return this.client.put<AppLink>(`applinks/${appLinkId}`, data);
	}

	async delete(appLinkId: string): Promise<{ message: string }> {
		return this.client.delete<{ message: string }>(`applinks/${appLinkId}`);
	}
}
