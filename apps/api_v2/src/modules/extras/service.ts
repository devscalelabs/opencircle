import { prisma } from "../../utils/prisma";
import { BadRequestError } from "../../exceptions";
import type { UrlPreviewQuery } from "./schema";

async function fetchOgTags(url: string): Promise<{
	title: string | null;
	description: string | null;
	imageUrl: string | null;
}> {
	try {
		const response = await fetch(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (compatible; OpenCircleBot/1.0; +https://opencircle.ai)",
			},
			signal: AbortSignal.timeout(10000),
		});

		if (!response.ok) {
			throw new BadRequestError("Unable to fetch metadata from the URL");
		}

		const contentType = response.headers.get("content-type") || "";
		if (!contentType.includes("text/html")) {
			throw new BadRequestError("Unable to fetch metadata from the URL");
		}

		const html = await response.text();

		const getMetaContent = (html: string, property: string): string | null => {
			const regex = new RegExp(
				`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["'][^>]*>`,
				"i",
			);
			const match = html.match(regex);
			if (match) return match[1].trim() || null;

			const reverseRegex = new RegExp(
				`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["'][^>]*>`,
				"i",
			);
			const reverseMatch = html.match(reverseRegex);
			return reverseMatch ? reverseMatch[1].trim() || null : null;
		};

		const titleRegex = /<title[^>]*>([^<]*)<\/title>/i;
		const titleMatch = html.match(titleRegex);

		const title =
			getMetaContent(html, "og:title") ||
			(titleMatch ? titleMatch[1].trim() : null);
		const description =
			getMetaContent(html, "og:description") ||
			getMetaContent(html, "description");
		const imageUrl = getMetaContent(html, "og:image");

		return { title, description, imageUrl };
	} catch (error) {
		if (error instanceof BadRequestError) throw error;
		throw new BadRequestError("Unable to fetch metadata from the URL");
	}
}

export async function getUrlPreview(query: UrlPreviewQuery) {
	const { url } = query;

	const cached = await prisma.urlPreview.findUnique({
		where: { url },
	});

	if (cached && !cached.deletedAt) {
		return cached;
	}

	const { title, description, imageUrl } = await fetchOgTags(url);

	return prisma.urlPreview.upsert({
		where: { url },
		create: {
			url,
			title,
			description,
			imageUrl,
		},
		update: {
			title,
			description,
			imageUrl,
		},
	});
}
