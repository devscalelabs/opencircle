export const NotificationListSkeleton = () => {
	return (
		<div className="divide-y divide-border">
			{Array.from({ length: 5 }).map((_, index) => (
				<div key={index} className="flex gap-3 p-3">
					{/* Avatar */}
					<div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-background-secondary" />

					{/* Content */}
					<div className="min-w-0 flex-1 space-y-2">
						{/* Message */}
						<div className="h-4 w-3/4 animate-pulse rounded bg-background-secondary" />
						{/* Timestamp */}
						<div className="h-3 w-20 animate-pulse rounded bg-background-secondary" />
					</div>

					{/* Action buttons */}
					<div className="flex items-start gap-2">
						<div className="h-7 w-16 animate-pulse rounded bg-background-secondary" />
						<div className="h-7 w-24 animate-pulse rounded bg-background-secondary" />
						<div className="h-2 w-2 animate-pulse rounded-full bg-background-secondary" />
					</div>
				</div>
			))}
		</div>
	);
};
