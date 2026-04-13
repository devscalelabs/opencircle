import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import {
	registerSchema,
	registerAdminSchema,
	loginSchema,
	refreshTokenSchema,
	logoutSchema,
	githubCallbackSchema,
	googleCallbackSchema,
	resetPasswordSchema,
	confirmResetPasswordSchema,
	verifyEmailSchema,
} from "./schema";
import {
	registerUser,
	registerAdmin,
	loginUser,
	refreshToken,
	logoutUser,
	initiateGithubAuth,
	handleGithubCallback,
	initiateGoogleAuth,
	handleGoogleCallback,
	requestPasswordReset,
	confirmPasswordReset,
	verifyEmail,
	createTokensForOAuthUser,
} from "./service";

export const authRouter = new Hono<Context>()
	.post("/register", zValidator("json", registerSchema), async (c) => {
		const data = c.req.valid("json");
		const user = await registerUser(data);
		return c.json(
			{
				data: {
					message: "User registered successfully",
					user_id: user.id,
				},
			},
			201,
		);
	})
	.post(
		"/register-admin",
		zValidator("json", registerAdminSchema),
		async (c) => {
			const data = c.req.valid("json");
			const user = await registerAdmin(data);
			return c.json(
				{
					data: {
						message: "Admin registered successfully",
						user_id: user.id,
					},
				},
				201,
			);
		},
	)
	.post("/login", zValidator("json", loginSchema), async (c) => {
		const data = c.req.valid("json");
		const result = await loginUser(data);
		return c.json({ data: result });
	})
	.post("/refresh", zValidator("json", refreshTokenSchema), async (c) => {
		const data = c.req.valid("json");
		const result = await refreshToken(data.refresh_token);
		return c.json({ data: result });
	})
	.post("/logout", zValidator("json", logoutSchema), async (c) => {
		const data = c.req.valid("json");
		const result = await logoutUser(data.refresh_token);
		return c.json({ data: result });
	})
	.get("/github/login", async (c) => {
		const result = initiateGithubAuth();
		return c.json({ data: result });
	})
	.post(
		"/github/callback",
		zValidator("json", githubCallbackSchema),
		async (c) => {
			const { code } = c.req.valid("json");
			const user = await handleGithubCallback(code);
			const tokens = await createTokensForOAuthUser(user.id);
			return c.json({
				data: {
					...tokens,
					user_id: user.id,
					username: user.username,
					email: user.email,
					name: user.name,
					avatar_url: user.avatarUrl,
				},
			});
		},
	)
	.get("/google/login", async (c) => {
		const result = initiateGoogleAuth();
		return c.json({ data: result });
	})
	.post(
		"/google/callback",
		zValidator("json", googleCallbackSchema),
		async (c) => {
			const { code } = c.req.valid("json");
			const user = await handleGoogleCallback(code);
			const tokens = await createTokensForOAuthUser(user.id);
			return c.json({
				data: {
					...tokens,
					user_id: user.id,
					username: user.username,
					email: user.email,
					name: user.name,
					avatar_url: user.avatarUrl,
				},
			});
		},
	)
	.post(
		"/reset-password",
		zValidator("json", resetPasswordSchema),
		async (c) => {
			const data = c.req.valid("json");
			const result = await requestPasswordReset(data.email);
			return c.json({ data: result });
		},
	)
	.post(
		"/confirm-reset-password",
		zValidator("json", confirmResetPasswordSchema),
		async (c) => {
			const data = c.req.valid("json");
			const result = await confirmPasswordReset(data.code, data.password);
			return c.json({ data: result });
		},
	)
	.post("/verify-email", zValidator("json", verifyEmailSchema), async (c) => {
		const data = c.req.valid("json");
		const result = await verifyEmail(data.code);
		return c.json({ data: result });
	});
