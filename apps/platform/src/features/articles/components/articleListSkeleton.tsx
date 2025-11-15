export const ArticleListSkeleton = () => {
	return (
		<div>
			{Array.from({ length: 3 }).map((_, index) => (
				<main key={index} className="space-y-4 border-border border-b p-4">
					{/* Article title and content preview */}
					<div className="space-y-3">
						{/* Title */}
						<div className="h-6 w-3/4 animate-pulse rounded bg-background-secondary" />
						{/* Content lines */}
						<div className="space-y-2">
							<div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
							<div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
							<div className="h-4 w-5/6 animate-pulse rounded bg-background-secondary" />
							<div className="h-4 w-4/6 animate-pulse rounded bg-background-secondary" />
						</div>
					</div>

					{/* Author section */}
					<section className="mt-4 flex items-center gap-2">
						<div className="h-10 w-10 animate-pulse rounded-full bg-background-secondary" />
						<div className="space-y-1.5">
							<div className="h-4 w-32 animate-pulse rounded bg-background-secondary" />
							<div className="h-3 w-24 animate-pulse rounded bg-background-secondary" />
						</div>
					</section>

					{/* Reactions and comments */}
					<section className="mt-4 flex items-center gap-4">
						<div className="h-5 w-12 animate-pulse rounded bg-background-secondary" />
						<div className="h-5 w-12 animate-pulse rounded bg-background-secondary" />
					</section>
				</main>
			))}
		</div>
	);
};
