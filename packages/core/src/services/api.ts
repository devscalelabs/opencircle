import type { Hooks } from "ky";
import { AccountRouter } from "./routers/account";
import { ArticlesRouter } from "./routers/articles";
import { AuthRouter } from "./routers/auth";
import { ChannelsRouter } from "./routers/channels";
import { CoursesRouter } from "./routers/courses";
import { ExtrasRouter } from "./routers/extras";
import { InviteCodesRouter } from "./routers/invite-codes";
import { MediaRouter } from "./routers/media";
import { NotificationsRouter } from "./routers/notifications";
import { PostsRouter } from "./routers/posts";
import { ReactionsRouter } from "./routers/reactions";
import { UsersRouter } from "./routers/users";

export class Api {
	public users: UsersRouter;
	public auth: AuthRouter;
	public channels: ChannelsRouter;
	public posts: PostsRouter;
	public media: MediaRouter;
	public account: AccountRouter;
	public reactions: ReactionsRouter;
	public articles: ArticlesRouter;
	public courses: CoursesRouter;
	public extras: ExtrasRouter;
	public inviteCodes: InviteCodesRouter;
	public notifications: NotificationsRouter;

	constructor(baseUrl: string, hooks?: Hooks) {
		this.users = new UsersRouter(baseUrl, hooks);
		this.auth = new AuthRouter(baseUrl, hooks);
		this.channels = new ChannelsRouter(baseUrl, hooks);
		this.posts = new PostsRouter(baseUrl, hooks);
		this.media = new MediaRouter(baseUrl, hooks);
		this.account = new AccountRouter(baseUrl, hooks);
		this.reactions = new ReactionsRouter(baseUrl, hooks);
		this.articles = new ArticlesRouter(baseUrl, hooks);
		this.courses = new CoursesRouter(baseUrl, hooks);
		this.extras = new ExtrasRouter(baseUrl, hooks);
		this.inviteCodes = new InviteCodesRouter(baseUrl, hooks);
		this.notifications = new NotificationsRouter(baseUrl, hooks);
	}
}

// Factory function for creating the API instance
export function createApi(baseUrl: string, hooks?: Hooks): Api {
	return new Api(baseUrl, hooks);
}

// Export all types from the shared types file for convenience
export type {
	Article,
	ArticleCreate,
	ArticleUpdate,
	Channel,
	ChannelCreate,
	ChannelType,
	ChannelUpdate,
	Course,
	CourseCreate,
	CourseStatus,
	CourseUpdate,
	EnrolledCourse,
	EnrolledCourseCreate,
	EnrolledCourseUpdate,
	EnrollmentStatus,
	InviteCode,
	InviteCodeCreate,
	InviteCodeStatus,
	InviteCodeUpdate,
	InviteCodeUsageStats,
	InviteCodeValidateRequest,
	InviteCodeValidateResponse,
	Lesson,
	LessonCreate,
	LessonType,
	LessonUpdate,
	LoginRequest,
	LoginResponse,
	Media,
	MediaCreate,
	MediaUpdate,
	Notification,
	NotificationType,
	Post,
	PostCreate,
	PostType,
	PostUpdate,
	Reaction,
	ReactionCreate,
	RegisterRequest,
	RegisterResponse,
	Role,
	Section,
	SectionCreate,
	SectionUpdate,
	UrlPreview,
	User,
	UserCreate,
	UserUpdate,
	UserUpdateWithFile,
} from "./types";
