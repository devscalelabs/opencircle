export const CourseListSkeleton = () => {
	return (
		<div>
			{Array.from({ length: 3 }).map((_, index) => (
				<main key={index} className="border-border border-b p-6">
					<div>
						{/* Thumbnail */}
						<div className="h-46 w-full animate-pulse rounded-t bg-background-secondary" />

						{/* Course info section */}
						<section className="space-y-2 rounded-b border-border border-t bg-black/50 p-4">
							<div className="space-y-2">
								{/* Title and badge */}
								<div className="flex items-center gap-2">
									<div className="h-6 w-48 animate-pulse rounded bg-background-secondary" />
									<div className="h-5 w-16 animate-pulse rounded bg-background-secondary" />
								</div>

								{/* Description */}
								<div className="space-y-1.5">
									<div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
									<div className="h-4 w-3/4 animate-pulse rounded bg-background-secondary" />
								</div>
							</div>

							{/* Status, price, sections */}
							<div className="flex items-center justify-start gap-4">
								<div className="h-3 w-20 animate-pulse rounded bg-background-secondary" />
								<div className="h-3 w-12 animate-pulse rounded bg-background-secondary" />
								<div className="h-3 w-16 animate-pulse rounded bg-background-secondary" />
							</div>

							{/* Instructor section */}
							<section className="flex items-center justify-start gap-2 pt-2">
								<div className="h-10 w-10 animate-pulse rounded-full bg-background-secondary" />
								<div className="space-y-1.5">
									<div className="h-4 w-32 animate-pulse rounded bg-background-secondary" />
									<div className="h-3 w-20 animate-pulse rounded bg-background-secondary" />
								</div>
							</section>
						</section>
					</div>
				</main>
			))}
		</div>
	);
};
