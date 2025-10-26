import { BaseRouter } from "../../baseRouter";
import type { Reaction, ReactionCreate } from "../../types";

export type ReactionResponse = Reaction | { message: string };

export class ReactionsRouter extends BaseRouter {
	async create(data: ReactionCreate): Promise<ReactionResponse> {
		return this.client.post<ReactionResponse>("reactions/", data);
	}

	async delete(postId: string, emoji: string): Promise<{ message: string }> {
		return this.client.delete<{ message: string }>(
			`reactions/?post_id=${postId}&emoji=${encodeURIComponent(emoji)}`,
		);
	}
}
