interface TableSkeletonProps {
	rowCount?: number;
}

export const TableSkeleton = ({ rowCount = 5 }: TableSkeletonProps) => {
	return (
		<div className="rounded-lg border border-border bg-background shadow-sm">
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-border">
					<thead className="bg-background-secondary/50">
						<tr>
							{[1, 2, 3, 4, 5].map((col) => (
								<th key={col} className="px-6 py-3">
									<div className="h-4 w-20 animate-pulse rounded bg-foreground/10" />
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-border bg-background">
						{Array.from({ length: rowCount }).map((_, rowIndex) => (
							<tr key={`skeleton-row-${rowIndex}`}>
								{[1, 2, 3, 4, 5].map((col) => (
									<td
										key={`skeleton-cell-${rowIndex}-${col}`}
										className="px-6 py-4"
									>
										<div className="h-4 w-24 animate-pulse rounded bg-foreground/10" />
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};
