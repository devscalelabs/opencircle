export interface AppSettings {
	id: string;
	app_name: string;
	app_logo_url?: string;
	enable_sign_up: boolean;
	enable_opencircle_branding: boolean;
	oauth_github_enabled: boolean;
	oauth_google_enabled: boolean;
	created_at: string;
	updated_at: string;
}

export interface AppSettingsCreate {
	app_name?: string;
	app_logo_url?: string;
	enable_sign_up?: boolean;
	enable_opencircle_branding?: boolean;
}

export interface AppSettingsUpdate {
	app_name?: string;
	app_logo_url: string | null;
	enable_sign_up?: boolean;
	enable_opencircle_branding?: boolean;
}
