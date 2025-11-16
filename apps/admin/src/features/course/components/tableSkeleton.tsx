interface TableSkeletonProps {
	rowCount?: number;
	className?: string;
}

export const TableSkeleton = ({
	rowCount = 5,
	className,
}: TableSkeletonProps) => {
	return (
		<div
			className={`rounded-lg border border-border bg-background shadow-sm ${className || ""}`}
		>
			<div className="p-6">
				<div className="space-y-3">
					{[...Array(rowCount)].map((_, i) => (
						<div
							key={`table-skeleton-row-${i}`}
							className="animate-pulse border-border border-b pb-4 last:border-0"
						>
							<div className="flex items-center gap-4">
								<div className="flex-1 space-y-2">
									<div className="h-4 w-48 rounded bg-background-secondary"></div>
									<div className="h-3 w-32 rounded bg-background-secondary"></div>
								</div>
								<div className="h-6 w-20 rounded-full bg-background-secondary"></div>
								<div className="h-4 w-24 rounded bg-background-secondary"></div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
