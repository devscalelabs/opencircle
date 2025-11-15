export const ChannelListSkeleton = () => {
	return (
		<div className="space-y-3">
			{Array.from({ length: 6 }).map((_, index) => (
				<div key={index} className="flex w-fit items-center gap-3">
					{/* Emoji placeholder */}
					<div className="h-5 w-5 animate-pulse rounded bg-background-secondary" />
					{/* Channel name placeholder */}
					<div className="h-4 w-24 animate-pulse rounded bg-background-secondary" />
				</div>
			))}
		</div>
	);
};
