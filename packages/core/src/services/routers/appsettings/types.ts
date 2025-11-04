export interface AppSettings {
	id: string;
	app_name: string;
	app_logo_url?: string;
	enable_sign_up: boolean;
	created_at: string;
	updated_at: string;
}

export interface AppSettingsCreate {
	app_name?: string;
	app_logo_url?: string;
	enable_sign_up?: boolean;
}

export interface AppSettingsUpdate {
	app_name?: string;
	app_logo_url: string | null;
	enable_sign_up?: boolean;
}
