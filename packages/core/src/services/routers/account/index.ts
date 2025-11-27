import { BaseRouter } from "../../../utils/baseRouter";
import type {
	RevokeSessionRequest,
	RevokeSessionResponse,
	Session,
	User,
} from "../../types";

export class AccountRouter extends BaseRouter {
	async getAccount(): Promise<User> {
		return this.client.get<User>("account");
	}

	async getSessions(): Promise<Session[]> {
		return this.client.get<Session[]>("account/sessions");
	}

	async revokeSession(
		data: RevokeSessionRequest,
	): Promise<RevokeSessionResponse> {
		return this.client.post<RevokeSessionResponse>(
			"account/sessions/revoke",
			data,
		);
	}
}
