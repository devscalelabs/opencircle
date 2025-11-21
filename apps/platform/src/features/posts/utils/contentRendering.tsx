import { Link } from "@tanstack/react-router";
import { parseContent } from "./contentParsing";

export const renderContent = (content: string) => {
	const parts = parseContent(content);

	return parts.map((part, index) => {
		const key = `part-${index}`;

		if ("isMention" in part && part.isMention) {
			return (
				<Link
					key={key}
					to="/$username"
					params={{ username: part.username }}
					className="font-medium text-indigo-400 hover:underline"
					onClick={(e) => e.stopPropagation()}
				>
					{part.text}
				</Link>
			);
		}

		if ("isUrl" in part && part.isUrl) {
			return (
				<a
					key={key}
					href={part.url}
					target="_blank"
					rel="noopener noreferrer"
					className="text-blue-400 hover:underline"
					onClick={(e) => e.stopPropagation()}
				>
					{part.text}
				</a>
			);
		}

		return <span key={key}>{part.text}</span>;
	});
};

export const renderTruncatedContent = (
	content: string,
	maxLength: number = 300,
	onReadMoreClick?: () => void,
) => {
	if (content.length <= maxLength) {
		return renderContent(content);
	}

	// Find the last space before maxLength to avoid cutting words
	const lastSpaceIndex = content.lastIndexOf(" ", maxLength);
	const truncatedEnd =
		lastSpaceIndex > maxLength * 0.8 ? lastSpaceIndex : maxLength;
	const truncated = `${content.slice(0, truncatedEnd)}...`;

	return (
		<>
			{renderContent(truncated)}
			{onReadMoreClick && (
				<span
					className="ml-1 cursor-pointer text-blue-400 hover:text-blue-300"
					onClick={(e) => {
						e.stopPropagation();
						onReadMoreClick();
					}}
				>
					read more
				</span>
			)}
		</>
	);
};
