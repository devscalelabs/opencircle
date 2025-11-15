export const PostsListSkeleton = () => {
	return (
		<div>
			{Array.from({ length: 3 }).map((_, index) => (
				<div
					key={index}
					className="max-w-2xl space-y-2 border-border border-b p-4"
				>
					{/* Header with avatar and user info */}
					<div className="flex items-center gap-2">
						<div className="h-10 w-10 animate-pulse rounded-full bg-background-secondary" />
						<div className="space-y-1.5">
							<div className="h-4 w-32 animate-pulse rounded bg-background-secondary" />
							<div className="h-3 w-24 animate-pulse rounded bg-background-secondary" />
						</div>
					</div>

					{/* Content section with left margin to align with avatar */}
					<div className="ml-10 space-y-4">
						{/* Content lines */}
						<div className="space-y-2">
							<div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
							<div className="h-4 w-5/6 animate-pulse rounded bg-background-secondary" />
							<div className="h-4 w-3/4 animate-pulse rounded bg-background-secondary" />
						</div>

						{/* Channel and timestamp */}
						<div className="flex items-center gap-2">
							<div className="h-6 w-20 animate-pulse rounded-full bg-background-secondary" />
							<div className="h-3 w-16 animate-pulse rounded bg-background-secondary" />
						</div>

						{/* Footer actions */}
						<div className="flex items-center gap-4">
							<div className="h-5 w-12 animate-pulse rounded bg-background-secondary" />
							<div className="h-5 w-12 animate-pulse rounded bg-background-secondary" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
};
