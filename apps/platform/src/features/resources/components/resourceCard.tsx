import { LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Resource } from "@opencircle/core";

interface ResourceCardProps {
	resource: Resource;
}

export const ResourceCard = ({ resource }: ResourceCardProps) => {
	return (
		<div className="rounded-lg border border-border p-4 transition-colors hover:bg-background-secondary">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1">
					<a
						href={resource.url}
						target="_blank"
						rel="noopener noreferrer"
						className="group mb-2 flex items-center gap-2 text-primary hover:underline"
					>
						<span className="truncate font-medium text-sm">{resource.url}</span>
						<HugeiconsIcon
							icon={LinkSquare02Icon}
							size={14}
							className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
						/>
					</a>
					{resource.description && (
						<p className="line-clamp-2 text-foreground/70 text-sm">
							{resource.description}
						</p>
					)}
					<div className="mt-2 flex items-center gap-2 text-foreground/50 text-xs">
						<span>
							📌 {resource.channel.emoji} {resource.channel.name}
						</span>
						<span>•</span>
						<span>By {resource.user.name || resource.user.username}</span>
					</div>
				</div>
			</div>
		</div>
	);
};
