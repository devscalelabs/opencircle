// Shared types to avoid circular imports

export const Role = {
	ADMIN: "admin",
	USER: "user",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const InviteCodeStatus = {
	ACTIVE: "active",
	USED: "used",
	EXPIRED: "expired",
} as const;

export type InviteCodeStatus =
	(typeof InviteCodeStatus)[keyof typeof InviteCodeStatus];

export const PostType = {
	POST: "post",
	COMMENT: "comment",
	ARTICLE: "article",
} as const;

export type PostType = (typeof PostType)[keyof typeof PostType];

export const ChannelType = {
	PUBLIC: "public",
	PRIVATE: "private",
} as const;

export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType];

export const CourseStatus = {
	DRAFT: "draft",
	PUBLISHED: "published",
	ARCHIVED: "archived",
} as const;

export type CourseStatus = (typeof CourseStatus)[keyof typeof CourseStatus];

export const LessonType = {
	VIDEO: "video",
	TEXT: "text",
	QUIZ: "quiz",
	ASSIGNMENT: "assignment",
} as const;

export type LessonType = (typeof LessonType)[keyof typeof LessonType];

export const EnrollmentStatus = {
	ACTIVE: "active",
	COMPLETED: "completed",
	DROPPED: "dropped",
} as const;

export type EnrollmentStatus =
	(typeof EnrollmentStatus)[keyof typeof EnrollmentStatus];

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

export interface Course {
	id: string;
	title: string;
	description?: string;
	thumbnail_url?: string;
	status: CourseStatus;
	instructor_id: string;
	price?: number;
	instructor: User;
	sections: Section[];
	enrollments: EnrolledCourse[];
	created_at: string;
	updated_at: string;
}

export interface CourseCreate {
	title: string;
	description?: string;
	thumbnail_url?: string;
	status?: CourseStatus;
	instructor_id: string;
	price?: number;
}

export interface CourseUpdate {
	title?: string;
	description?: string;
	thumbnail_url?: string;
	status?: CourseStatus;
	instructor_id?: string;
	price?: number;
}

export interface Section {
	id: string;
	title: string;
	description?: string;
	order: number;
	course_id: string;
	course: Course;
	lessons: Lesson[];
	created_at: string;
	updated_at: string;
}

export interface SectionCreate {
	title: string;
	description?: string;
	order: number;
	course_id: string;
}

export interface SectionUpdate {
	title?: string;
	description?: string;
	order?: number;
	course_id?: string;
}

export interface Lesson {
	id: string;
	title: string;
	content?: string;
	video_url?: string;
	order: number;
	type: LessonType;
	section_id: string;
	section: Section;
	created_at: string;
	updated_at: string;
}

export interface LessonCreate {
	title: string;
	content?: string;
	video_url?: string;
	order: number;
	type?: LessonType;
	section_id: string;
}

export interface LessonUpdate {
	title?: string;
	content?: string;
	video_url?: string;
	order?: number;
	type?: LessonType;
	section_id?: string;
}

export interface EnrolledCourse {
	id: string;
	user_id: string;
	course_id: string;
	status: EnrollmentStatus;
	enrolled_at?: string;
	completed_at?: string;
	user: User;
	course: Course;
	created_at: string;
	updated_at: string;
}

export interface EnrolledCourseCreate {
	user_id: string;
	course_id: string;
	status?: EnrollmentStatus;
	enrolled_at?: string;
	completed_at?: string;
}

export interface EnrolledCourseUpdate {
	user_id?: string;
	course_id?: string;
	status?: EnrollmentStatus;
	enrolled_at?: string;
	completed_at?: string;
}

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

export interface UrlPreview {
	url: string;
	title?: string;
	description?: string;
	image_url?: string;
	created_at: string;
}

// Invite Code Types
export interface InviteCode {
	id: string;
	code: string;
	max_uses: number;
	used_count: number;
	expires_at?: string;
	status: InviteCodeStatus;
	created_by: string;
	auto_join_channel_id?: string;
	created_at: string;
	updated_at: string;
}

export interface InviteCodeCreate {
	code?: string;
	max_uses?: number;
	expires_at?: string;
	auto_join_channel_id?: string;
	created_by: string;
}

export interface InviteCodeUpdate {
	max_uses?: number;
	expires_at?: string;
	auto_join_channel_id?: string;
	status?: InviteCodeStatus;
}

export interface InviteCodeUsageStats {
	code: string;
	max_uses: number;
	used_count: number;
	remaining_uses: number;
	status: InviteCodeStatus;
	expires_at?: string;
	used_by_users: Array<{
		id: string;
		username: string;
		email: string;
	}>;
}

export interface InviteCodeValidateRequest {
	code: string;
	user_id: string;
}

export interface InviteCodeValidateResponse {
	valid: boolean;
	invite_code?: InviteCode;
	message: string;
	auto_joined_channel: boolean;
	channel_id?: string;
}

export const NotificationType = {
	MENTION: "mention",
	LIKE: "like",
} as const;

export type NotificationType =
	(typeof NotificationType)[keyof typeof NotificationType];

export interface Notification {
	id: string;
	recipient_id: string;
	sender_id: string;
	type: NotificationType;
	data?: Record<string, unknown>;
	is_read: boolean;
	recipient: User;
	sender: User;
	created_at: string;
	updated_at: string;
}

// App Settings Types
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
	app_logo_url?: string;
	enable_sign_up?: boolean;
}
