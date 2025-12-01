interface MentionMatch {
	text: string;
	username: string;
	isMention: boolean;
}

interface UrlMatch {
	text: string;
	url: string;
	isUrl: boolean;
}

export type ContentMatch = MentionMatch | UrlMatch;

export const parseMentions = (content: string): MentionMatch[] => {
	const parts: MentionMatch[] = [];
	// Simple mention regex - now safe because URLs are parsed first
	const mentionRegex = /@(\w+)/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while (true) {
		match = mentionRegex.exec(content);
		if (match === null) break;
		// Add text before the mention
		if (match.index > lastIndex) {
			const textBefore = content.slice(lastIndex, match.index);
			if (textBefore) {
				parts.push({
					text: textBefore,
					username: "",
					isMention: false,
				});
			}
		}

		// Add the mention
		parts.push({
			text: match[0],
			username: match[1],
			isMention: true,
		});

		lastIndex = mentionRegex.lastIndex;
	}

	// Add remaining text after the last mention
	if (lastIndex < content.length) {
		const remainingText = content.slice(lastIndex);
		if (remainingText) {
			parts.push({
				text: remainingText,
				username: "",
				isMention: false,
			});
		}
	}

	return parts.length > 0
		? parts
		: [{ text: content, username: "", isMention: false }];
};

export const parseUrls = (content: string): UrlMatch[] => {
	const parts: UrlMatch[] = [];
	// URL regex pattern - matches http, https, and www URLs
	// This improved pattern handles URLs with @ symbols (like user@domain.com) and query parameters
	const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while (true) {
		match = urlRegex.exec(content);
		if (match === null) break;
		// Add text before the URL
		if (match.index > lastIndex) {
			const textBefore = content.slice(lastIndex, match.index);
			if (textBefore) {
				parts.push({
					text: textBefore,
					url: "",
					isUrl: false,
				});
			}
		}

		// Add the URL
		let url = match[0];
		// Add https:// if it starts with www.
		if (url.startsWith("www.")) {
			url = `https://${url}`;
		}

		parts.push({
			text: match[0],
			url: url,
			isUrl: true,
		});

		lastIndex = urlRegex.lastIndex;
	}

	// Add remaining text after the last URL
	if (lastIndex < content.length) {
		const remainingText = content.slice(lastIndex);
		if (remainingText) {
			parts.push({
				text: remainingText,
				url: "",
				isUrl: false,
			});
		}
	}

	return parts.length > 0 ? parts : [{ text: content, url: "", isUrl: false }];
};

export const extractMentions = (content: string): string[] => {
	const mentions: string[] = [];
	const regex = /@(\w+)/g;
	let match: RegExpExecArray | null;
	while (true) {
		match = regex.exec(content);
		if (match === null) break;
		mentions.push(match[1]);
	}
	return [...new Set(mentions)];
};

export const parseContent = (content: string): ContentMatch[] => {
	// First parse URLs to avoid breaking URLs that contain @ symbols
	const urlParts = parseUrls(content);
	const allParts: ContentMatch[] = [];

	// Then parse mentions within each part
	for (const part of urlParts) {
		if (part.isUrl) {
			// If it's a URL, add it directly without parsing mentions inside
			allParts.push(part);
		} else {
			// If it's text, parse mentions within it
			const mentionParts = parseMentions(part.text);
			allParts.push(...mentionParts);
		}
	}

	return allParts;
};
