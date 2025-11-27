import type { Hooks } from "ky";
import { AccountRouter } from "../services/routers/account";
import { AppLinksRouter } from "../services/routers/applinks";
import { AppSettingsRouter } from "../services/routers/appsettings";
import { ArticlesRouter } from "../services/routers/articles";
import { AuthRouter } from "../services/routers/auth";
import { ChannelsRouter } from "../services/routers/channels";
import { CoursesRouter } from "../services/routers/courses";
import { ExtrasRouter } from "../services/routers/extras";
import { InviteCodesRouter } from "../services/routers/invite-codes";
import { MediaRouter } from "../services/routers/media";
import { NotificationsRouter } from "../services/routers/notifications";
import { PostsRouter } from "../services/routers/posts";
import { PresenceRouter } from "../services/routers/presence";
import { ReactionsRouter } from "../services/routers/reactions";
import { ResourcesRouter } from "../services/routers/resources";
import { UsersRouter } from "../services/routers/users";

export class Api {
	public users: UsersRouter;
	public auth: AuthRouter;
	public appSettings: AppSettingsRouter;
	public appLinks: AppLinksRouter;
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
	public resources: ResourcesRouter;
	public presence: PresenceRouter;

	constructor(baseUrl: string, hooks?: Hooks) {
		this.users = new UsersRouter(baseUrl, hooks);
		this.auth = new AuthRouter(baseUrl, hooks);
		this.appSettings = new AppSettingsRouter(baseUrl, hooks);
		this.appLinks = new AppLinksRouter(baseUrl, hooks);
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
		this.resources = new ResourcesRouter(baseUrl, hooks);
		this.presence = new PresenceRouter(baseUrl, hooks);
	}
}

// Factory function for creating the API instance
export function createApi(baseUrl: string, hooks?: Hooks): Api {
	return new Api(baseUrl, hooks);
}

// Export all types from the shared types file for convenience
export type {
	ActiveUser,
	ActiveUsersResponse,
	AppLink,
	AppLinkCreate,
	AppLinkUpdate,
	AppSettings,
	AppSettingsCreate,
	AppSettingsUpdate,
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
	LogoutRequest,
	LogoutResponse,
	Media,
	MediaCreate,
	MediaUpdate,
	Notification,
	NotificationType,
	Post,
	PostCreate,
	PostType,
	PostUpdate,
	PresenceSession,
	PresenceStats,
	Reaction,
	ReactionCreate,
	RefreshTokenRequest,
	RefreshTokenResponse,
	RegisterRequest,
	RegisterResponse,
	Resource,
	ResourceCreate,
	ResourceUpdate,
	RevokeSessionRequest,
	RevokeSessionResponse,
	Role,
	Section,
	SectionCreate,
	SectionUpdate,
	Session,
	TimeseriesDataPoint,
	TimeseriesResponse,
	UrlPreview,
	User,
	UserCreate,
	UserPresenceResponse,
	UserUpdate,
	UserUpdateWithFile,
} from "../services/types";
