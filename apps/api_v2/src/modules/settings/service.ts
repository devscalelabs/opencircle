import { prisma } from "../../utils/prisma";
import { NotFoundError } from "../../exceptions";
import { uploadFile } from "../../utils/storage";
import type { SettingsUpdateInput } from "./schema";

export async function getSettings() {
	const settings = await prisma.appSettings.findUnique({
		where: { id: "singleton" },
	});

	if (!settings) {
		throw new NotFoundError("Settings");
	}

	const oauthGithubEnabled = !!(
		process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
	);
	const oauthGoogleEnabled = !!(
		process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
	);

	return {
		...settings,
		oauthGithubEnabled,
		oauthGoogleEnabled,
	};
}

export async function updateSettings(data: SettingsUpdateInput) {
	const settings = await prisma.appSettings.findUnique({
		where: { id: "singleton" },
	});

	if (!settings) {
		throw new NotFoundError("Settings");
	}

	const updated = await prisma.appSettings.update({
		where: { id: "singleton" },
		data,
	});

	const oauthGithubEnabled = !!(
		process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
	);
	const oauthGoogleEnabled = !!(
		process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
	);

	return {
		...updated,
		oauthGithubEnabled,
		oauthGoogleEnabled,
	};
}

export async function uploadLogo(file: {
	name: string;
	type: string;
	data: Buffer;
}) {
	if (!file.type.startsWith("image/")) {
		throw new Error("File must be an image");
	}

	const logoUrl = await uploadFile(file, "logos");

	const updated = await prisma.appSettings.update({
		where: { id: "singleton" },
		data: { appLogoUrl: logoUrl },
	});

	const oauthGithubEnabled = !!(
		process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
	);
	const oauthGoogleEnabled = !!(
		process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
	);

	return {
		...updated,
		oauthGithubEnabled,
		oauthGoogleEnabled,
	};
}

export async function getCount() {
	const count = await prisma.appSettings.count();
	return { count };
}

export async function getInstallationStatus() {
	const adminCount = await prisma.user.count({
		where: { role: "admin", isActive: true },
	});
	return { isInstalled: adminCount >= 1, adminCount };
}
