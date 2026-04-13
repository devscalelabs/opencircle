import crypto from "node:crypto";
import bcryptjs from "bcryptjs";
import { prisma } from "../../utils/prisma";
import { signAccessToken, hashToken } from "../../utils/jwt";
import {
	sendPasswordResetEmail,
	sendEmailVerification,
} from "../../utils/email";
import {
	ConflictError,
	BadRequestError,
	ForbiddenError,
	UnauthorizedError,
	NotFoundError,
} from "../../exceptions";

const REFRESH_TOKEN_EXPIRE_DAYS = Number(
	process.env.REFRESH_TOKEN_EXPIRE_DAYS || "30",
);
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || "";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "";

function generateRandomCode(length = 6): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	let code = "";
	const randomBytes = crypto.randomBytes(length);
	for (let i = 0; i < length; i++) {
		code += chars[randomBytes[i] % chars.length];
	}
	return code;
}

function generateSecureToken(): string {
	return crypto.randomBytes(48).toString("base64url");
}

async function hashPassword(password: string): Promise<string> {
	return bcryptjs.hash(password, 10);
}

async function verifyPassword(
	plainPassword: string,
	hashedPassword: string,
): Promise<boolean> {
	return bcryptjs.compare(plainPassword, hashedPassword);
}

export async function registerUser(data: {
	name?: string;
	username: string;
	email: string;
	password: string;
	inviteCode?: string;
}) {
	const appSettings = await prisma.appSettings.findFirst();
	if (appSettings && !appSettings.enableSignUp) {
		throw new ForbiddenError(
			"Registration is currently disabled. Please contact the administrator.",
		);
	}

	if (data.inviteCode) {
		const inviteCodeRecord = await prisma.inviteCode.findUnique({
			where: { code: data.inviteCode },
		});
		if (!inviteCodeRecord) {
			throw new BadRequestError("Invalid invite code");
		}
		if (inviteCodeRecord.status !== "active") {
			throw new BadRequestError(`Invite code is ${inviteCodeRecord.status}`);
		}
		if (inviteCodeRecord.expiresAt && new Date() > inviteCodeRecord.expiresAt) {
			await prisma.inviteCode.update({
				where: { id: inviteCodeRecord.id },
				data: { status: "expired" },
			});
			throw new BadRequestError("Invite code has expired");
		}
		if (inviteCodeRecord.usedCount >= inviteCodeRecord.maxUses) {
			throw new BadRequestError("Invite code has been fully used");
		}
	}

	const existingUser = await prisma.user.findFirst({
		where: {
			OR: [{ username: data.username }, { email: data.email }],
		},
	});
	if (existingUser) {
		if (existingUser.username === data.username) {
			throw new ConflictError("Username already registered");
		}
		throw new ConflictError("Email already registered");
	}

	const hashedPassword = await hashPassword(data.password);

	const user = await prisma.user.create({
		data: {
			name: data.name,
			username: data.username,
			email: data.email,
			password: hashedPassword,
			isActive: false,
			isVerified: false,
		},
	});

	await prisma.userSettings
		.create({
			data: {
				userId: user.id,
				isOnboarded: false,
			},
		})
		.catch(() => {});

	await prisma.userSocial
		.create({
			data: {
				userId: user.id,
			},
		})
		.catch(() => {});

	const code = generateRandomCode(6);
	const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
	await prisma.emailVerification.create({
		data: {
			code,
			email: data.email,
			userId: user.id,
			expiresAt,
			status: "active",
		},
	});

	await sendEmailVerification(data.email, code).catch((err) => {
		console.error("Failed to send verification email:", err);
	});

	if (data.inviteCode) {
		const inviteCodeRecord = await prisma.inviteCode.findUnique({
			where: { code: data.inviteCode },
		});
		if (inviteCodeRecord) {
			await prisma.inviteCode.update({
				where: { id: inviteCodeRecord.id },
				data: {
					usedCount: { increment: 1 },
					status:
						inviteCodeRecord.usedCount + 1 >= inviteCodeRecord.maxUses
							? "used"
							: "active",
				},
			});

			await prisma.user.update({
				where: { id: user.id },
				data: { inviteCodeId: inviteCodeRecord.id },
			});

			if (inviteCodeRecord.autoJoinChannelId) {
				await prisma.channelMember
					.create({
						data: {
							channelId: inviteCodeRecord.autoJoinChannelId,
							userId: user.id,
						},
					})
					.catch(() => {});
			}
		}
	}

	return user;
}

export async function registerAdmin(data: {
	name: string;
	username: string;
	email: string;
	password: string;
}) {
	const adminCount = await prisma.user.count({
		where: { role: "admin" },
	});
	if (adminCount > 0) {
		throw new ForbiddenError(
			"Admin user already exists. Cannot create additional admin accounts.",
		);
	}

	const existingUser = await prisma.user.findFirst({
		where: {
			OR: [{ username: data.username }, { email: data.email }],
		},
	});
	if (existingUser) {
		if (existingUser.username === data.username) {
			throw new ConflictError("Username already registered");
		}
		throw new ConflictError("Email already registered");
	}

	const hashedPassword = await hashPassword(data.password);

	const user = await prisma.user.create({
		data: {
			name: data.name,
			username: data.username,
			email: data.email,
			password: hashedPassword,
			isActive: true,
			isVerified: true,
			role: "admin",
		},
	});

	await prisma.userSettings
		.create({
			data: {
				userId: user.id,
				isOnboarded: false,
			},
		})
		.catch(() => {});

	await prisma.userSocial
		.create({
			data: {
				userId: user.id,
			},
		})
		.catch(() => {});

	return user;
}

export async function loginUser(data: {
	username: string;
	password: string;
	deviceName?: string;
	deviceType?: string;
	browser?: string;
	os?: string;
}) {
	const user = await prisma.user.findUnique({
		where: { username: data.username },
	});
	if (!user || !user.password) {
		throw new UnauthorizedError("Invalid credentials");
	}

	if (!user.isActive) {
		throw new ForbiddenError(
			"Your account has been banned. Please contact support.",
		);
	}

	const validPassword = await verifyPassword(data.password, user.password);
	if (!validPassword) {
		throw new UnauthorizedError("Invalid credentials");
	}

	const accessToken = signAccessToken(user.username);
	const refreshToken = generateSecureToken();
	const refreshTokenHash = hashToken(refreshToken);
	const expiresAt = new Date(
		Date.now() + REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
	);

	await prisma.refreshToken.create({
		data: {
			tokenHash: refreshTokenHash,
			userId: user.id,
			status: "active",
			expiresAt,
			deviceName: data.deviceName,
			deviceType: data.deviceType,
			browser: data.browser,
			os: data.os,
			lastUsedAt: new Date(),
		},
	});

	return {
		access_token: accessToken,
		refresh_token: refreshToken,
		token_type: "bearer",
	};
}

export async function refreshToken(token: string) {
	const tokenHash = hashToken(token);
	const refreshTokenRecord = await prisma.refreshToken.findUnique({
		where: { tokenHash },
	});

	if (!refreshTokenRecord || refreshTokenRecord.status !== "active") {
		throw new UnauthorizedError("Invalid or expired refresh token");
	}

	if (new Date() > refreshTokenRecord.expiresAt) {
		await prisma.refreshToken.update({
			where: { id: refreshTokenRecord.id },
			data: { status: "expired" },
		});
		throw new UnauthorizedError("Invalid or expired refresh token");
	}

	const user = await prisma.user.findUnique({
		where: { id: refreshTokenRecord.userId },
	});
	if (!user || !user.isActive) {
		throw new UnauthorizedError("Invalid or expired refresh token");
	}

	await prisma.refreshToken.update({
		where: { id: refreshTokenRecord.id },
		data: { lastUsedAt: new Date() },
	});

	const accessToken = signAccessToken(user.username);

	return {
		access_token: accessToken,
		token_type: "bearer",
	};
}

export async function logoutUser(token: string) {
	const tokenHash = hashToken(token);
	const refreshTokenRecord = await prisma.refreshToken.findUnique({
		where: { tokenHash },
	});

	if (!refreshTokenRecord) {
		return { message: "Successfully logged out" };
	}

	await prisma.refreshToken.update({
		where: { id: refreshTokenRecord.id },
		data: { status: "revoked" },
	});

	return { message: "Successfully logged out" };
}

export function initiateGithubAuth() {
	if (!GITHUB_CLIENT_ID) {
		throw new BadRequestError("GitHub OAuth not configured");
	}

	const state = generateSecureToken();
	const params = new URLSearchParams({
		client_id: GITHUB_CLIENT_ID,
		redirect_uri: GITHUB_REDIRECT_URI,
		scope: "user:email",
		state,
	});

	const authorizationUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

	return { authorization_url: authorizationUrl, state };
}

export async function handleGithubCallback(code: string) {
	if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
		throw new BadRequestError("GitHub OAuth not configured");
	}

	const tokenResponse = await fetch(
		"https://github.com/login/oauth/access_token",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				client_id: GITHUB_CLIENT_ID,
				client_secret: GITHUB_CLIENT_SECRET,
				code,
			}),
		},
	);

	const tokenData = (await tokenResponse.json()) as Record<string, unknown>;
	const accessToken = tokenData.access_token as string | undefined;

	if (!accessToken) {
		throw new BadRequestError("Failed to exchange code for access token");
	}

	const userResponse = await fetch("https://api.github.com/user", {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"User-Agent": "OpenCircle",
		},
	});

	if (!userResponse.ok) {
		throw new BadRequestError("Failed to fetch GitHub user info");
	}

	const githubUser = (await userResponse.json()) as Record<string, unknown>;
	let email = githubUser.email as string | null;

	if (!email) {
		const emailResponse = await fetch("https://api.github.com/user/emails", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"User-Agent": "OpenCircle",
			},
		});
		if (emailResponse.ok) {
			const emails = (await emailResponse.json()) as Array<{
				email: string;
				primary: boolean;
			}>;
			const primaryEmail = emails.find((e) => e.primary);
			email = primaryEmail?.email || emails[0]?.email || null;
		}
	}

	if (!email) {
		throw new BadRequestError("Could not retrieve email from GitHub");
	}

	const login = githubUser.login as string;
	const name = (githubUser.name as string | null) || null;
	const avatarUrl = (githubUser.avatar_url as string | null) || null;

	const existingUser = await prisma.user.findUnique({ where: { email } });

	if (existingUser) {
		if (!existingUser.isActive) {
			throw new ForbiddenError(
				"Your account has been banned. Please contact support.",
			);
		}

		const updateData: Record<string, unknown> = {};
		if (avatarUrl && existingUser.avatarUrl !== avatarUrl) {
			updateData.avatarUrl = avatarUrl;
		}
		if (name && existingUser.name !== name) {
			updateData.name = name;
		}
		if (Object.keys(updateData).length > 0) {
			await prisma.user.update({
				where: { id: existingUser.id },
				data: updateData,
			});
		}

		return existingUser;
	}

	const appSettings = await prisma.appSettings.findFirst();
	if (appSettings && !appSettings.enableSignUp) {
		throw new ForbiddenError(
			"Registration is currently disabled. Please contact the administrator.",
		);
	}

	let username = login.toLowerCase();
	let counter = 1;
	while (await prisma.user.findUnique({ where: { username } })) {
		username = `${login.toLowerCase()}${counter}`;
		counter++;
	}

	const newUser = await prisma.user.create({
		data: {
			username,
			email,
			name,
			avatarUrl,
			isActive: true,
			isVerified: true,
			password: null,
		},
	});

	await prisma.userSettings
		.create({
			data: { userId: newUser.id, isOnboarded: false },
		})
		.catch(() => {});

	await prisma.userSocial
		.create({
			data: { userId: newUser.id },
		})
		.catch(() => {});

	return newUser;
}

export function initiateGoogleAuth() {
	if (!GOOGLE_CLIENT_ID) {
		throw new BadRequestError("Google OAuth not configured");
	}

	const state = generateSecureToken();
	const params = new URLSearchParams({
		client_id: GOOGLE_CLIENT_ID,
		redirect_uri: GOOGLE_REDIRECT_URI,
		scope: "openid email profile",
		response_type: "code",
		state,
	});

	const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

	return { authorization_url: authorizationUrl, state };
}

export async function handleGoogleCallback(code: string) {
	if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
		throw new BadRequestError("Google OAuth not configured");
	}

	const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			code,
			client_id: GOOGLE_CLIENT_ID,
			client_secret: GOOGLE_CLIENT_SECRET,
			redirect_uri: GOOGLE_REDIRECT_URI,
			grant_type: "authorization_code",
		}),
	});

	const tokenData = (await tokenResponse.json()) as Record<string, unknown>;
	const accessToken = tokenData.access_token as string | undefined;

	if (!accessToken) {
		throw new BadRequestError("Failed to exchange code for access token");
	}

	const userResponse = await fetch(
		"https://www.googleapis.com/oauth2/v1/userinfo",
		{
			headers: { Authorization: `Bearer ${accessToken}` },
		},
	);

	if (!userResponse.ok) {
		throw new BadRequestError("Failed to fetch Google user info");
	}

	const googleUser = (await userResponse.json()) as Record<string, unknown>;
	const email = googleUser.email as string;
	const name = (googleUser.name as string | null) || null;
	const picture = (googleUser.picture as string | null) || null;

	if (!email) {
		throw new BadRequestError("Could not retrieve email from Google");
	}

	const existingUser = await prisma.user.findUnique({ where: { email } });

	if (existingUser) {
		if (!existingUser.isActive) {
			throw new ForbiddenError(
				"Your account has been banned. Please contact support.",
			);
		}

		const updateData: Record<string, unknown> = {};
		if (picture && existingUser.avatarUrl !== picture) {
			updateData.avatarUrl = picture;
		}
		if (name && existingUser.name !== name) {
			updateData.name = name;
		}
		if (Object.keys(updateData).length > 0) {
			await prisma.user.update({
				where: { id: existingUser.id },
				data: updateData,
			});
		}

		return existingUser;
	}

	const appSettings = await prisma.appSettings.findFirst();
	if (appSettings && !appSettings.enableSignUp) {
		throw new ForbiddenError(
			"Registration is currently disabled. Please contact the administrator.",
		);
	}

	const baseUsername = email.split("@")[0].toLowerCase();
	let username = baseUsername;
	let counter = 1;
	while (await prisma.user.findUnique({ where: { username } })) {
		username = `${baseUsername}${counter}`;
		counter++;
	}

	const newUser = await prisma.user.create({
		data: {
			username,
			email,
			name,
			avatarUrl: picture,
			isActive: true,
			isVerified: true,
			password: null,
		},
	});

	await prisma.userSettings
		.create({
			data: { userId: newUser.id, isOnboarded: false },
		})
		.catch(() => {});

	await prisma.userSocial
		.create({
			data: { userId: newUser.id },
		})
		.catch(() => {});

	return newUser;
}

export async function requestPasswordReset(email: string) {
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) {
		return {
			message:
				"If your email is registered, you will receive a password reset link",
		};
	}

	await prisma.passwordReset.updateMany({
		where: { email, status: "active" },
		data: { status: "expired" },
	});

	const code = generateRandomCode(6);
	const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

	await prisma.passwordReset.create({
		data: {
			code,
			email,
			userId: user.id,
			expiresAt,
			status: "active",
		},
	});

	await sendPasswordResetEmail(email, code).catch((err) => {
		console.error("Failed to send password reset email:", err);
	});

	return {
		message:
			"If your email is registered, you will receive a password reset link",
	};
}

export async function confirmPasswordReset(code: string, newPassword: string) {
	const resetRecord = await prisma.passwordReset.findUnique({
		where: { code },
	});

	if (!resetRecord || resetRecord.status !== "active") {
		throw new BadRequestError("Invalid or expired reset code");
	}

	if (new Date() > resetRecord.expiresAt) {
		await prisma.passwordReset.update({
			where: { id: resetRecord.id },
			data: { status: "expired" },
		});
		throw new BadRequestError("Invalid or expired reset code");
	}

	await prisma.passwordReset.update({
		where: { id: resetRecord.id },
		data: { status: "used" },
	});

	const hashedPassword = await hashPassword(newPassword);
	await prisma.user.update({
		where: { id: resetRecord.userId },
		data: { password: hashedPassword },
	});

	return { message: "Password reset successfully" };
}

export async function verifyEmail(code: string) {
	const verification = await prisma.emailVerification.findUnique({
		where: { code },
	});

	if (!verification || verification.status !== "active") {
		throw new BadRequestError("Invalid or expired verification code");
	}

	if (new Date() > verification.expiresAt) {
		await prisma.emailVerification.update({
			where: { id: verification.id },
			data: { status: "expired" },
		});
		throw new BadRequestError("Invalid or expired verification code");
	}

	await prisma.emailVerification.update({
		where: { id: verification.id },
		data: { status: "used" },
	});

	await prisma.user.update({
		where: { id: verification.userId },
		data: { isVerified: true, isActive: true },
	});

	return { message: "Email verified successfully" };
}

export async function createTokensForOAuthUser(
	userId: string,
	deviceInfo?: {
		device_name?: string;
		device_type?: string;
		browser?: string;
		os?: string;
	},
) {
	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (!user) {
		throw new NotFoundError("User");
	}

	const accessToken = signAccessToken(user.username);
	const refreshToken = generateSecureToken();
	const refreshTokenHash = hashToken(refreshToken);
	const expiresAt = new Date(
		Date.now() + REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
	);

	await prisma.refreshToken.create({
		data: {
			tokenHash: refreshTokenHash,
			userId: user.id,
			status: "active",
			expiresAt,
			deviceName: deviceInfo?.device_name,
			deviceType: deviceInfo?.device_type,
			browser: deviceInfo?.browser,
			os: deviceInfo?.os,
			lastUsedAt: new Date(),
		},
	});

	return {
		access_token: accessToken,
		refresh_token: refreshToken,
		token_type: "bearer",
	};
}
