import { BaseRouter } from "../../baseRouter";
import type {
	LoginRequest,
	LoginResponse,
	RegisterRequest,
	RegisterResponse,
} from "../../types";

export class AuthRouter extends BaseRouter {
	async register(data: RegisterRequest): Promise<RegisterResponse> {
		return this.client.post<RegisterResponse>("register", data);
	}

	async login(data: LoginRequest): Promise<LoginResponse> {
		return this.client.post<LoginResponse>("login", data);
	}
}
