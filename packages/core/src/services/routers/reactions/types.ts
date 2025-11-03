import type { User } from "../auth/types";

export interface Reaction {
	id: string;
	user_id: string;
	post_id: string;
	emoji: string;
	user: User;
	created_at: string;
	updated_at: string;
}

export interface ReactionCreate {
	post_id: string;
	emoji: string;
}

export type ReactionResponse = Reaction | { message: string };
