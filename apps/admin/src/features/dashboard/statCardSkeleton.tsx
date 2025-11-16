interface StatCardSkeletonProps {
	cardCount?: number;
	className?: string;
}

export const StatCardSkeleton = ({
	cardCount = 4,
	className,
}: StatCardSkeletonProps) => {
	return (
		<div
			className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-${cardCount} ${className || ""}`}
		>
			{[...Array(cardCount)].map((_, i) => (
				<div
					key={`stat-card-skeleton-${i}`}
					className="animate-pulse rounded-lg bg-background p-6 shadow"
				>
					<div className="flex items-center justify-between">
						<div className="space-y-2">
							<div className="h-4 w-24 rounded bg-background-secondary"></div>
							<div className="h-8 w-16 rounded bg-background-secondary"></div>
						</div>
						<div className="h-12 w-12 rounded-lg bg-background-secondary"></div>
					</div>
				</div>
			))}
		</div>
	);
};
