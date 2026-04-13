import { z } from "zod";

export const registerSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	username: z
		.string()
		.min(3)
		.max(50)
		.regex(/^[a-zA-Z0-9_-]+$/),
	email: z.string().email(),
	password: z.string().min(8).max(128),
	invite_code: z.string().optional(),
});

export const registerAdminSchema = z.object({
	name: z.string().min(1).max(100),
	username: z
		.string()
		.min(3)
		.max(50)
		.regex(/^[a-zA-Z0-9_-]+$/),
	email: z.string().email(),
	password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
	username: z.string().min(1),
	password: z.string().min(1),
	device_name: z.string().max(255).optional(),
	device_type: z.string().max(100).optional(),
	browser: z.string().max(255).optional(),
	os: z.string().max(255).optional(),
});

export const refreshTokenSchema = z.object({
	refresh_token: z.string().min(1),
});

export const logoutSchema = z.object({
	refresh_token: z.string().min(1),
});

export const githubCallbackSchema = z.object({
	code: z.string().min(1),
});

export const googleCallbackSchema = z.object({
	code: z.string().min(1),
});

export const resetPasswordSchema = z.object({
	email: z.string().email(),
});

export const confirmResetPasswordSchema = z.object({
	code: z.string().min(1),
	password: z.string().min(8).max(128),
});

export const verifyEmailSchema = z.object({
	code: z.string().min(1),
});
