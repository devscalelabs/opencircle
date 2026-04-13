import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { errorHandler } from "./middleware/error-handler";
import type { Context } from "./types";
import { authRouter } from "./modules/auth/router";
import { accountRouter } from "./modules/account/router";
import { sessionsRouter } from "./modules/sessions/router";
import { usersRouter } from "./modules/users/router";
import { postsRouter } from "./modules/posts/router";
import { channelsRouter } from "./modules/channels/router";
import { channelMembersRouter } from "./modules/channel-members/router";
import { mediasRouter } from "./modules/media/router";
import { reactionsRouter } from "./modules/reactions/router";
import { articlesRouter } from "./modules/articles/router";
import { coursesRouter } from "./modules/courses/router";
import { extrasRouter } from "./modules/extras/router";
import { inviteCodesRouter } from "./modules/invite-codes/router";
import { notificationsRouter } from "./modules/notifications/router";
import { notificationPreferencesRouter } from "./modules/notification-preferences/router";
import { broadcastsRouter } from "./modules/broadcasts/router";
import { resourcesRouter } from "./modules/resources/router";
import { applinksRouter } from "./modules/applinks/router";
import { settingsRouter } from "./modules/settings/router";
import { presenceRouter } from "./modules/presence/router";

const app = new Hono<Context>();

app.use("*", logger());
app.use(
	"*",
	cors({
		origin: "*",
		allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

app.onError(errorHandler);

app.get("/health", (c) => c.json({ status: "ok" }));

const api = new Hono<Context>()
	.route("/", authRouter)
	.route("/", accountRouter)
	.route("/", sessionsRouter)
	.route("/", usersRouter)
	.route("/", postsRouter)
	.route("/", channelsRouter)
	.route("/", channelMembersRouter)
	.route("/", mediasRouter)
	.route("/", reactionsRouter)
	.route("/", articlesRouter)
	.route("/", coursesRouter)
	.route("/", extrasRouter)
	.route("/", inviteCodesRouter)
	.route("/", notificationsRouter)
	.route("/", notificationPreferencesRouter)
	.route("/", broadcastsRouter)
	.route("/", resourcesRouter)
	.route("/", applinksRouter)
	.route("/", settingsRouter)
	.route("/", presenceRouter);

app.route("/api", api);

export { app };

export default app;
