// API Client

// tRPC-style API
export { Api, createApi } from "./api";
export { ApiClient } from "./apiClient";
export { ArticlesRouter } from "./routers/articles";
export { AuthRouter } from "./routers/auth";
export { ChannelsRouter } from "./routers/channels";
export { MediaRouter } from "./routers/media";
export { PostsRouter } from "./routers/posts";
export { ReactionsRouter } from "./routers/reactions";
// Re-export routers for direct access if needed
export { UsersRouter } from "./routers/users";
// Export all types from the shared types file for convenience
export type {
	Channel,
	ChannelCreate,
	ChannelType,
	ChannelUpdate,
	LoginRequest,
	LoginResponse,
	Media,
	MediaCreate,
	MediaUpdate,
	Post,
	PostCreate,
	PostType,
	PostUpdate,
	Reaction,
	ReactionCreate,
	ReactionSummary,
	ReactionSummaryItem,
	RegisterRequest,
	RegisterResponse,
	Role,
	User,
	UserCreate,
	UserUpdate,
} from "./types";
