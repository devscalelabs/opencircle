import { Header } from "../../../components/header";

export const ArticleDetailSkeleton = () => {
	return (
		<main>
			<Header label="Back" />
			<div className="prose prose-invert max-w-none p-4 prose-headings:font-medium">
				<div className="prose prose-invert prose-headings:font-medium prose-headings:text-foreground prose-headings:text-xl prose-p:text-foreground/70 prose-p:text-sm prose-p:leading-relaxed">
					{/* Article title */}
					<div className="mb-6 h-8 w-3/4 animate-pulse rounded bg-background-secondary" />

					{/* Article content */}
					<div className="space-y-4">
						<div className="space-y-2">
							<div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
							<div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
							<div className="h-4 w-5/6 animate-pulse rounded bg-background-secondary" />
						</div>

						<div className="space-y-2">
							<div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
							<div className="h-4 w-4/5 animate-pulse rounded bg-background-secondary" />
							<div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
						</div>

						<div className="space-y-2">
							<div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
							<div className="h-4 w-5/6 animate-pulse rounded bg-background-secondary" />
							<div className="h-4 w-3/4 animate-pulse rounded bg-background-secondary" />
						</div>
					</div>
				</div>

				{/* Actions section */}
				<section className="mt-6 flex items-center gap-4 border-border border-t pt-4">
					<div className="h-9 w-20 animate-pulse rounded-lg bg-background-secondary" />
					<div className="h-5 w-12 animate-pulse rounded bg-background-secondary" />
					<div className="h-5 w-12 animate-pulse rounded bg-background-secondary" />
				</section>
			</div>

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
