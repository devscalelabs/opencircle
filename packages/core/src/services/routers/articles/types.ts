import type { Post } from "../posts/types";

export interface ArticleCreate {
	title: string;
	content: string;
	user_id: string;
	channel_id?: string;
}

export interface ArticleUpdate {
	title?: string;
	content?: string;
	user_id?: string;
	channel_id?: string;
}

export type Article = Post;
