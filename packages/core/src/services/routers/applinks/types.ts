export interface AppLink {
	id: string;
	label: string;
	url: string;
	created_at: string;
	updated_at: string;
}

export interface AppLinkCreate {
	label: string;
	url: string;
}

export interface AppLinkUpdate {
	label?: string;
	url?: string;
}
