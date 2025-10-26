import { BaseRouter } from "../../baseRouter";
import type { User } from "../../types";

export class AccountRouter extends BaseRouter {
	async getAccount(): Promise<User> {
		return this.client.get<User>("account");
	}
}
