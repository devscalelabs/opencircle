import type { User } from "../auth/types";
import type { Channel } from "../channels/types";
import type { Media } from "../media/types";

export const PostType = {
	POST: "post",
	COMMENT: "comment",
	ARTICLE: "article",
} as const;

export type PostType = (typeof PostType)[keyof typeof PostType];

export interface ReactionSummaryItem {
	emoji: string;
	count: number;
	me: boolean;
}

export interface ReactionSummary {
	summary: ReactionSummaryItem[];
	user_reaction_ids: string[];
}

export interface CommentSummary {
	count: number;
	names: string[];
	me: boolean;
}

export interface Post {
	id: string;
	content: string;
	title?: string;
	type: PostType;
	is_pinned: boolean;
	user_id: string;
	channel_id?: string;
	parent_id?: string;
	user: User;
	channel?: Channel;
	medias: Media[];
	comment_count: number;
	reaction_count: number;
	reactions?: ReactionSummary;
	comment_summary?: CommentSummary;
	has_reacted?: boolean;
	created_at: string;
	updated_at: string;
}

export interface PostCreate {
	content: string;
	type?: PostType;
	user_id: string;
	channel_id?: string;
	parent_id?: string;
}

export interface PostUpdate {
	content?: string;
	type?: PostType;
	user_id?: string;
	channel_id?: string;
	parent_id?: string;
}
