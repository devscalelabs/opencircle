export const ChannelType = {
	PUBLIC: "public",
	PRIVATE: "private",
} as const;

export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType];

export interface Channel {
	id: string;
	name: string;
	description?: string;
	slug: string;
	type: ChannelType;
	emoji: string;
	created_at: string;
	updated_at: string;
}

export interface ChannelCreate {
	name: string;
	description?: string;
	slug: string;
	type?: ChannelType;
	emoji?: string;
}

export interface ChannelUpdate {
	name?: string;
	description?: string;
	slug?: string;
	type?: ChannelType;
	emoji?: string;
}
