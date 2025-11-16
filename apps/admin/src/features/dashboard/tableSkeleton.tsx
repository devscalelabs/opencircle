interface TableSkeletonProps {
	rowCount?: number;
	className?: string;
	showHeader?: boolean;
}

export const TableSkeleton = ({
	rowCount = 5,
	className,
	showHeader = true,
}: TableSkeletonProps) => {
	return (
		<div
			className={`rounded-lg border border-border bg-background shadow-sm ${className || ""}`}
		>
			{showHeader && (
				<div className="border-border border-b px-6 py-4">
					<div className="h-6 w-48 animate-pulse rounded bg-background-secondary" />
				</div>
			)}
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
