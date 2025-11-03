export interface Media {
	id: string;
	url: string;
	post_id: string;
	user_id: string;
	created_at: string;
	updated_at: string;
}

export interface MediaCreate {
	url: string;
	post_id: string;
	user_id: string;
}

export interface MediaUpdate {
	url?: string;
	post_id?: string;
	user_id?: string;
}
