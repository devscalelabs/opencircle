import { prisma } from "../../utils/prisma";
import { NotFoundError } from "../../exceptions";
import type {
	AppLinkCreateInput,
	AppLinkUpdateInput,
	ListAppLinksQuery,
} from "./schema";

export async function createAppLink(data: AppLinkCreateInput) {
	return prisma.appLink.create({
		data: {
			label: data.label,
			url: data.url,
		},
	});
}

export async function listAppLinks(query: ListAppLinksQuery) {
	const { page, limit } = query;
	const skip = (page - 1) * limit;

	const where = { deletedAt: null };

	const [items, total] = await Promise.all([
		prisma.appLink.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
		}),
		prisma.appLink.count({ where }),
	]);

	return { items, total, page, limit };
}

export async function getAppLink(id: string) {
	const appLink = await prisma.appLink.findUnique({
		where: { id, deletedAt: null },
	});

	if (!appLink) {
		throw new NotFoundError("App link");
	}

	return appLink;
}

export async function updateAppLink(id: string, data: AppLinkUpdateInput) {
	const appLink = await prisma.appLink.findUnique({
		where: { id, deletedAt: null },
	});

	if (!appLink) {
		throw new NotFoundError("App link");
	}

	return prisma.appLink.update({
		where: { id },
		data,
	});
}

export async function deleteAppLink(id: string) {
	const appLink = await prisma.appLink.findUnique({
		where: { id, deletedAt: null },
	});

	if (!appLink) {
		throw new NotFoundError("App link");
	}

	await prisma.appLink.update({
		where: { id },
		data: { deletedAt: new Date() },
	});

	return { id };
}
