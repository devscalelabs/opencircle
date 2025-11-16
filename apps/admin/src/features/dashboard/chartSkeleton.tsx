interface ChartSkeletonProps {
	height?: number;
	className?: string;
}

export const ChartSkeleton = ({
	height = 320,
	className,
}: ChartSkeletonProps) => {
	return (
		<div className={`rounded-lg bg-background p-6 shadow ${className || ""}`}>
			<h3 className="mb-4 font-semibold text-foreground text-lg">
				Loading Chart...
			</h3>
			<div
				className="animate-pulse rounded bg-background-secondary"
				style={{ height: `${height}px` }}
			/>
		</div>
	);
};
