import { Header } from "../../../components/header";

export const CourseDetailSkeleton = () => {
	return (
		<>
			<Header label="Back" />
			{/* Thumbnail */}
			<div className="h-48 w-full animate-pulse border-border border-b bg-background-secondary" />

			<main className="space-y-6 p-4">
				{/* Course title and info */}
				<div className="space-y-4">
					<div className="space-y-2">
						{/* Title */}
						<div className="h-8 w-3/4 animate-pulse rounded bg-background-secondary" />
						{/* Description */}
						<div className="space-y-1.5">
							<div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
							<div className="h-4 w-5/6 animate-pulse rounded bg-background-secondary" />
						</div>
						{/* Stats */}
						<div className="flex items-center gap-4">
							<div className="h-4 w-20 animate-pulse rounded bg-background-secondary" />
							<div className="h-4 w-12 animate-pulse rounded bg-background-secondary" />
							<div className="h-4 w-16 animate-pulse rounded bg-background-secondary" />
							<div className="h-4 w-20 animate-pulse rounded bg-background-secondary" />
						</div>
					</div>
				</div>

				{/* Instructor section */}
				<section className="flex items-center gap-2 rounded-lg bg-background/50">
					<div className="h-10 w-10 animate-pulse rounded-full bg-background-secondary" />
					<div className="space-y-1.5">
						<div className="h-4 w-32 animate-pulse rounded bg-background-secondary" />
						<div className="h-3 w-20 animate-pulse rounded bg-background-secondary" />
					</div>
				</section>

				{/* Enroll button */}
				<div className="mt-4">
					<div className="h-10 w-full animate-pulse rounded-lg bg-background-secondary" />
				</div>

				{/* Course content */}
				<div className="space-y-4">
					<div className="h-6 w-40 animate-pulse rounded bg-background-secondary" />
					<div className="space-y-4">
						{Array.from({ length: 2 }).map((_, sectionIndex) => (
							<div key={sectionIndex} className="space-y-3">
								{/* Section title */}
								<div className="h-5 w-48 animate-pulse rounded bg-background-secondary" />
								{/* Section description */}
								<div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
								{/* Lesson count */}
								<div className="h-3 w-20 animate-pulse rounded bg-background-secondary" />
								{/* Lessons */}
								<div className="space-y-2">
									{Array.from({ length: 3 }).map((_, lessonIndex) => (
										<div
											key={lessonIndex}
											className="space-y-2 rounded-md border border-border bg-background/30 p-3"
										>
											{/* Lesson title */}
											<div className="h-4 w-2/3 animate-pulse rounded bg-background-secondary" />
											{/* Lesson content */}
											<div className="space-y-1">
												<div className="h-3 w-full animate-pulse rounded bg-background-secondary" />
												<div className="h-3 w-4/5 animate-pulse rounded bg-background-secondary" />
											</div>
											{/* Video indicator */}
											<div className="h-3 w-24 animate-pulse rounded bg-background-secondary" />
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</main>
		</>
	);
};
