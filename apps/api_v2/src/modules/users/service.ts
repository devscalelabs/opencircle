import { hash } from "bcryptjs";
import { prisma } from "../../utils/prisma";
import { NotFoundError, ConflictError } from "../../exceptions";

export async function createUser(data: {
	name?: string;
	username: string;
	email: string;
	password: string;
	bio?: string;
	avatarUrl?: string;
}) {
	const existingUser = await prisma.user.findFirst({
		where: {
			OR: [{ username: data.username }, { email: data.email }],
		},
	});

	if (existingUser) {
		if (existingUser.username === data.username) {
			throw new ConflictError("Username already taken");
		}
		throw new ConflictError("Email already registered");
	}

	const hashedPassword = await hash(data.password, 12);

	const user = await prisma.user.create({
		data: {
			name: data.name,
			username: data.username,
			email: data.email,
			password: hashedPassword,
			bio: data.bio,
			avatarUrl: data.avatarUrl,
			settings: { create: {} },
			social: { create: {} },
		},
		include: {
			settings: true,
			social: true,
		},
	});

	const { password, ...userWithoutPassword } = user;
	return {
		...userWithoutPassword,
		is_active: user.isActive,
		is_verified: user.isVerified,
		avatar_url: user.avatarUrl,
		invite_code_id: user.inviteCodeId,
		created_at: user.createdAt,
		updated_at: user.updatedAt,
		deleted_at: user.deletedAt,
		settings: user.settings
			? {
					...user.settings,
					is_onboarded: user.settings.isOnboarded,
					user_id: user.settings.userId,
					created_at: user.settings.createdAt,
					updated_at: user.settings.updatedAt,
					deleted_at: user.settings.deletedAt,
				}
			: null,
		social: user.social
			? {
					...user.social,
					twitter_url: user.social.twitterUrl,
					linkedin_url: user.social.linkedinUrl,
					github_url: user.social.githubUrl,
					website_url: user.social.websiteUrl,
					user_id: user.social.userId,
					created_at: user.social.createdAt,
					updated_at: user.social.updatedAt,
					deleted_at: user.social.deletedAt,
				}
			: null,
	};
}

export async function getUser(id: string) {
	const user = await prisma.user.findUnique({
		where: { id },
		include: {
			settings: true,
			social: true,
		},
	});

	if (!user || user.deletedAt) {
		throw new NotFoundError("User");
	}

	const { password, ...userWithoutPassword } = user;
	return {
		...userWithoutPassword,
		is_active: user.isActive,
		is_verified: user.isVerified,
		avatar_url: user.avatarUrl,
		invite_code_id: user.inviteCodeId,
		created_at: user.createdAt,
		updated_at: user.updatedAt,
		deleted_at: user.deletedAt,
		settings: user.settings
			? {
					...user.settings,
					is_onboarded: user.settings.isOnboarded,
					user_id: user.settings.userId,
					created_at: user.settings.createdAt,
					updated_at: user.settings.updatedAt,
					deleted_at: user.settings.deletedAt,
				}
			: null,
		social: user.social
			? {
					...user.social,
					twitter_url: user.social.twitterUrl,
					linkedin_url: user.social.linkedinUrl,
					github_url: user.social.githubUrl,
					website_url: user.social.websiteUrl,
					user_id: user.social.userId,
					created_at: user.social.createdAt,
					updated_at: user.social.updatedAt,
					deleted_at: user.social.deletedAt,
				}
			: null,
	};
}

export async function listUsers(options: {
	page: number;
	limit: number;
	search?: string;
}) {
	const where = {
		deletedAt: null,
		...(options.search
			? {
					OR: [
						{
							name: { contains: options.search, mode: "insensitive" as const },
						},
						{
							username: {
								contains: options.search,
								mode: "insensitive" as const,
							},
						},
						{
							email: { contains: options.search, mode: "insensitive" as const },
						},
					],
				}
			: {}),
	};

	const [users, total] = await Promise.all([
		prisma.user.findMany({
			where,
			select: {
				id: true,
				name: true,
				username: true,
				email: true,
				bio: true,
				avatarUrl: true,
				isActive: true,
				isVerified: true,
				role: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: { createdAt: "desc" },
			skip: (options.page - 1) * options.limit,
			take: options.limit,
		}),
		prisma.user.count({ where }),
	]);

	const items = users.map((user) => ({
		...user,
		is_active: user.isActive,
		is_verified: user.isVerified,
		avatar_url: user.avatarUrl,
		created_at: user.createdAt,
		updated_at: user.updatedAt,
	}));

	return {
		items,
		total,
		page: options.page,
		limit: options.limit,
		total_pages: Math.ceil(total / options.limit),
	};
}

export async function updateUser(
	id: string,
	data: {
		name?: string;
		bio?: string;
		avatarUrl?: string;
		username?: string;
		email?: string;
	},
) {
	if (data.username) {
		const existing = await prisma.user.findFirst({
			where: { username: data.username, NOT: { id } },
		});
		if (existing) {
			throw new ConflictError("Username already taken");
		}
	}

	if (data.email) {
		const existing = await prisma.user.findFirst({
			where: { email: data.email, NOT: { id } },
		});
		if (existing) {
			throw new ConflictError("Email already registered");
		}
	}

	const user = await prisma.user.findUnique({ where: { id } });
	if (!user || user.deletedAt) {
		throw new NotFoundError("User");
	}

	const updated = await prisma.user.update({
		where: { id },
		data: {
			...(data.name !== undefined && { name: data.name }),
			...(data.bio !== undefined && { bio: data.bio }),
			...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
			...(data.username !== undefined && { username: data.username }),
			...(data.email !== undefined && { email: data.email }),
		},
		select: {
			id: true,
			name: true,
			username: true,
			email: true,
			bio: true,
			avatarUrl: true,
			isActive: true,
			isVerified: true,
			role: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	return {
		...updated,
		is_active: updated.isActive,
		is_verified: updated.isVerified,
		avatar_url: updated.avatarUrl,
		created_at: updated.createdAt,
		updated_at: updated.updatedAt,
	};
}

export async function deleteUser(id: string) {
	const user = await prisma.user.findUnique({ where: { id } });
	if (!user || user.deletedAt) {
		throw new NotFoundError("User");
	}

	await prisma.user.update({
		where: { id },
		data: { deletedAt: new Date() },
	});

	return { success: true };
}

export async function banUser(id: string) {
	const user = await prisma.user.findUnique({ where: { id } });
	if (!user || user.deletedAt) {
		throw new NotFoundError("User");
	}

	await prisma.user.update({
		where: { id },
		data: { isActive: false },
	});

	return {
		...user,
		is_active: false,
		is_verified: user.isVerified,
		avatar_url: user.avatarUrl,
		invite_code_id: user.inviteCodeId,
		created_at: user.createdAt,
		updated_at: user.updatedAt,
		deleted_at: user.deletedAt,
	};
}
