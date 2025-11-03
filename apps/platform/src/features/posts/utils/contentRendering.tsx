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
