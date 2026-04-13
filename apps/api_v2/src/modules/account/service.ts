import { prisma } from "../../utils/prisma";
import { NotFoundError } from "../../exceptions";

export async function getAccount(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: {
			settings: true,
			social: true,
		},
	});

	if (!user) {
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
