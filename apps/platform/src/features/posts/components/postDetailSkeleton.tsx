import { Header } from "../../../components/header";

export const PostDetailSkeleton = () => {
	return (
		<main>
			<Header label="Back" />
			<main className="relative max-w-2xl space-y-2 border-border border-b p-6">
				{/* Header with avatar and user info */}
				<section className="flex items-center gap-2">
					<div className="h-10 w-10 animate-pulse rounded-full bg-background-secondary" />
					<div className="space-y-1.5">
						<div className="h-4 w-32 animate-pulse rounded bg-background-secondary" />
						<div className="h-3 w-24 animate-pulse rounded bg-background-secondary" />
					</div>
				</section>

				{/* Content lines */}
				<div className="space-y-2 pt-2">
					<div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
					<div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
					<div className="h-4 w-5/6 animate-pulse rounded bg-background-secondary" />
					<div className="h-4 w-4/6 animate-pulse rounded bg-background-secondary" />
				</div>

				{/* Channel and timestamp */}
				<div className="mt-8 flex items-center gap-2">
					<div className="h-6 w-20 animate-pulse rounded-full bg-background-secondary" />
					<div className="h-3 w-16 animate-pulse rounded bg-background-secondary" />
				</div>

				{/* Action buttons */}
				<section className="flex items-center gap-4 pt-4">
					<div className="h-9 w-20 animate-pulse rounded-lg bg-background-secondary" />
					<div className="h-5 w-12 animate-pulse rounded bg-background-secondary" />
				</section>
			</main>

			{/* Replies skeleton */}
			<div className="space-y-0">
				{Array.from({ length: 2 }).map((_, index) => (
					<div
						key={index}
						className="max-w-2xl space-y-2 border-border border-b p-4"
					>
						{/* Reply header */}
						<div className="flex items-center gap-2">
							<div className="h-8 w-8 animate-pulse rounded-full bg-background-secondary" />
							<div className="space-y-1.5">
								<div className="h-3 w-24 animate-pulse rounded bg-background-secondary" />
								<div className="h-2.5 w-20 animate-pulse rounded bg-background-secondary" />
							</div>
						</div>

						{/* Reply content */}
						<div className="ml-10 space-y-2">
							<div className="h-3 w-full animate-pulse rounded bg-background-secondary" />
							<div className="h-3 w-4/5 animate-pulse rounded bg-background-secondary" />
						</div>
					</div>
				))}
			</div>
		</main>
	);
};
