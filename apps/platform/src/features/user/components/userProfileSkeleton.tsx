import { Header } from "../../../components/header";

export const UserProfileSkeleton = () => {
	return (
		<main>
			<Header label="Back" />
			<section className="flex flex-col items-center space-y-4 py-12">
				{/* Avatar */}
				<div className="h-24 w-24 animate-pulse rounded-full bg-background-secondary" />

				{/* User info */}
				<main className="flex flex-col items-center gap-4">
					<div className="space-y-2 text-center">
						{/* Name */}
						<div className="flex items-center justify-center gap-1">
							<div className="h-6 w-32 animate-pulse rounded bg-background-secondary" />
						</div>
						{/* Email */}
						<div className="flex justify-center">
							<div className="h-4 w-40 animate-pulse rounded bg-background-secondary" />
						</div>
					</div>
					{/* Bio */}
					<div className="h-4 w-64 animate-pulse rounded bg-background-secondary" />
				</main>

				{/* Social links */}
				<div className="flex items-center gap-4">
					<div className="h-5 w-5 animate-pulse rounded bg-background-secondary" />
					<div className="h-5 w-5 animate-pulse rounded bg-background-secondary" />
					<div className="h-5 w-5 animate-pulse rounded bg-background-secondary" />
				</div>
			</section>

			{/* Tabs skeleton */}
			<div className="border-border border-b">
				<div className="flex gap-8 px-4">
					<div className="h-10 w-16 animate-pulse rounded bg-background-secondary" />
					<div className="h-10 w-16 animate-pulse rounded bg-background-secondary" />
				</div>
			</div>

			{/* Posts skeleton */}
			<div>
				{Array.from({ length: 2 }).map((_, index) => (
					<div
						key={index}
						className="max-w-2xl space-y-2 border-border border-b p-4"
					>
						{/* Header with avatar and user info */}
						<div className="flex items-center gap-2">
							<div className="h-10 w-10 animate-pulse rounded-full bg-background-secondary" />
							<div className="space-y-1.5">
								<div className="h-4 w-32 animate-pulse rounded bg-background-secondary" />
								<div className="h-3 w-24 animate-pulse rounded bg-background-secondary" />
							</div>
						</div>

						{/* Content section */}
						<div className="ml-10 space-y-4">
							{/* Content lines */}
							<div className="space-y-2">
								<div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
								<div className="h-4 w-5/6 animate-pulse rounded bg-background-secondary" />
								<div className="h-4 w-3/4 animate-pulse rounded bg-background-secondary" />
							</div>

							{/* Channel and timestamp */}
							<div className="flex items-center gap-2">
								<div className="h-6 w-20 animate-pulse rounded-full bg-background-secondary" />
								<div className="h-3 w-16 animate-pulse rounded bg-background-secondary" />
							</div>

							{/* Footer actions */}
							<div className="flex items-center gap-4">
								<div className="h-5 w-12 animate-pulse rounded bg-background-secondary" />
								<div className="h-5 w-12 animate-pulse rounded bg-background-secondary" />
							</div>
						</div>
					</div>
				))}
			</div>
		</main>
	);
};
