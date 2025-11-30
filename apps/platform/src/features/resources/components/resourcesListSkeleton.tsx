export const ResourcesListSkeleton = () => {
	return (
		<div className="space-y-4 p-4">
			{Array.from({ length: 5 }).map((_, index) => (
				<div key={index} className="rounded-lg border border-border p-4">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0 flex-1 space-y-3">
							{/* URL link skeleton */}
							<div className="flex items-center gap-2">
								<div className="h-4 w-3/4 animate-pulse rounded bg-background-secondary" />
								<div className="h-3 w-3 animate-pulse rounded bg-background-secondary" />
							</div>

							{/* Description skeleton - only show if there might be one */}
							<div className="space-y-2">
								<div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
								<div className="h-4 w-5/6 animate-pulse rounded bg-background-secondary" />
							</div>

							{/* Footer info skeleton */}
							<div className="flex items-center gap-2">
								<div className="h-3 w-20 animate-pulse rounded bg-background-secondary" />
								<div className="h-3 w-2 animate-pulse rounded bg-background-secondary" />
								<div className="h-3 w-24 animate-pulse rounded bg-background-secondary" />
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};
