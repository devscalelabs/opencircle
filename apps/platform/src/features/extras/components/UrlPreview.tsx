import { parseUrls } from "../../posts/utils/contentParsing";
import { useUrlPreview } from "../hooks/useUrlPreview";

interface UrlPreviewProps {
	content: string;
}

export const UrlPreview = ({ content }: UrlPreviewProps) => {
	const { previews, isLoading } = useUrlPreview(content);

	if (isLoading || Object.keys(previews).length === 0) {
		return null;
	}

	const urlMatches = parseUrls(content).filter((match) => match.isUrl);
	const hasMultiplePreviews = urlMatches.length > 1;

	return (
		<div className={`${hasMultiplePreviews ? "space-y-2" : "space-y-3"} mt-3`}>
			{urlMatches.slice(0, 3).map((match) => {
				const preview = previews[match.url];
				if (!preview) return null;

				if (hasMultiplePreviews) {
					// Thumbnail layout for multiple previews
					return (
						<a
							onClick={(e) => e.stopPropagation()}
							key={preview.url}
							href={match.url}
							target="_blank"
							rel="noopener noreferrer"
							className="group flex gap-3 rounded-lg bg-background-secondary p-3 transition-colors hover:bg-background-secondary/80"
						>
							{preview.image_url && (
								<div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
									<img
										src={preview.image_url}
										alt={preview.title || "Preview"}
										className="h-full w-full object-cover"
									/>
								</div>
							)}
							<div className="min-w-0 flex-1">
								{preview.title && (
									<h3 className="line-clamp-2 font-bold text-foreground text-sm group-hover:underline">
										{preview.title}
									</h3>
								)}
								{preview.description && (
									<p className="mt-1 line-clamp-2 text-foreground/70 text-xs">
										{preview.description}
									</p>
								)}
								<p className="mt-2 truncate text-blue-400 text-xs">
									{match.url}
								</p>
							</div>
						</a>
					);
				}

				// Large preview layout for single preview
				return (
					<a
						key={preview.url}
						href={match.url}
						target="_blank"
						rel="noopener noreferrer"
						className="group relative block overflow-hidden rounded-lg"
					>
						{preview.image_url ? (
							<>
								<div className="absolute inset-0">
									<img
										src={preview.image_url}
										alt={preview.title || "Preview"}
										className="h-full w-full object-cover"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-40% to-transparent" />
								</div>
								<div className="relative flex min-h-[240px] flex-col justify-end p-4 pt-32">
									{preview.title && (
										<h3 className="line-clamp-2 font-bold text-lg text-white group-hover:underline">
											{preview.title}
										</h3>
									)}
									{preview.description && (
										<p className="line-clamp-3 text-sm text-white/90">
											{preview.description}
										</p>
									)}
									<p className="truncate text-white/70 text-xs">{match.url}</p>
								</div>
							</>
						) : (
							<div className="bg-background-secondary p-4">
								{preview.title && (
									<h3 className="mb-2 font-bold text-foreground text-lg group-hover:underline">
										{preview.title}
									</h3>
								)}
								{preview.description && (
									<p className="mb-3 text-foreground/70 text-sm">
										{preview.description}
									</p>
								)}
								<p className="truncate text-blue-400 text-xs">{match.url}</p>
							</div>
						)}
					</a>
				);
			})}
		</div>
	);
};
