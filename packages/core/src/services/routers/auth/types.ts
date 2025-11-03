export const Role = {
	ADMIN: "admin",
	USER: "user",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface UserSettings {
	is_onboarded: boolean;
}

export interface UserSocial {
	twitter_url?: string;
	linkedin_url?: string;
	github_url?: string;
	website_url?: string;
}

export interface User {
	id: string;
	name?: string;
	bio?: string;
	username: string;
	email: string;
	is_active: boolean;
	is_verified: boolean;
	avatar_url?: string;
	role: Role;
	created_at: string;
	updated_at: string;
	user_settings?: UserSettings;
	user_social?: UserSocial;
}

export interface UserCreate {
	username: string;
	email: string;
	password: string;
	is_active?: boolean;
	is_verified?: boolean;
	avatar_url?: string;
	role?: Role;
}

export interface UserUpdate {
	name?: string;
	bio?: string;
	username?: string;
	email?: string;
	password?: string;
	is_active?: boolean;
	is_verified?: boolean;
	avatar_url?: string;
	role?: Role;
}

export interface UserUpdateWithFile {
	name?: string;
	username?: string;
	bio?: string;
	email?: string;
	password?: string;
	is_active?: boolean;
	is_verified?: boolean;
	avatar_url?: string;
	role?: Role;
}

export interface RegisterRequest {
	name?: string;
	username: string;
	email: string;
	password: string;
	invite_code?: string;
}

export interface LoginRequest {
	username: string;
	password: string;
}

export interface RegisterResponse {
	message: string;
	user_id: string;
}

export interface LoginResponse {
	access_token: string;
	token_type: string;
}

export interface GitHubAuthUrlResponse {
	authorization_url: string;
	state: string;
}

export interface GitHubLoginRequest {
	code: string;
}

export interface GitHubLoginResponse {
	access_token: string;
	token_type: string;
	user_id: string;
	username: string;
	email: string;
	name?: string;
	avatar_url?: string;
}
