import { format } from "date-fns";
import type { Enrollment } from "../../services/dashboard";

interface RecentEnrollmentsProps {
	enrollments: Enrollment[];
	isLoading?: boolean;
}

const statusColors = {
	active: "bg-background-secondary text-foreground",
	completed: "bg-background-secondary text-foreground",
	dropped: "bg-background-secondary text-foreground",
};

export const RecentEnrollmentsTable = ({
	enrollments,
	isLoading,
}: RecentEnrollmentsProps) => {
	if (isLoading) {
		return (
			<div className="rounded-lg bg-background shadow">
				<div className="p-6">
					<h3 className="mb-4 font-semibold text-foreground text-lg">
						Recent Enrollments
					</h3>
					<div className="space-y-3">
						{[...Array(5)].map((i) => (
							<div
								key={`skeleton-enrollment-row-${i}`}
								className="animate-pulse"
							>
								<div className="flex items-center justify-between border-b p-4">
									<div className="flex-1 space-y-2">
										<div className="h-4 w-48 rounded bg-background-secondary"></div>
										<div className="h-3 w-32 rounded bg-background-secondary"></div>
									</div>
									<div className="h-6 w-20 rounded bg-background-secondary"></div>
									<div className="h-4 w-24 rounded bg-background-secondary"></div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "N/A";
		try {
			return format(new Date(dateString), "MMM dd, yyyy");
		} catch {
			return "N/A";
		}
	};

	return (
		<div className="rounded-lg bg-background shadow">
			<div className="p-6">
				<h3 className="mb-4 font-semibold text-foreground text-lg">
					Recent Enrollments
				</h3>
				<div className="overflow-x-auto">
					<table className="min-w-full">
						<thead>
							<tr className="border-b">
								<th className="px-4 py-3 text-left font-medium text-foreground text-sm">
									Username
								</th>
								<th className="px-4 py-3 text-left font-medium text-foreground text-sm">
									Course Title
								</th>
								<th className="px-4 py-3 text-left font-medium text-foreground text-sm">
									Status
								</th>
								<th className="px-4 py-3 text-left font-medium text-foreground text-sm">
									Enrollment Date
								</th>
							</tr>
						</thead>
						<tbody>
							{enrollments.length === 0 ? (
								<tr>
									<td colSpan={4} className="py-8 text-center text-foreground">
										No enrollments found
									</td>
								</tr>
							) : (
								enrollments.map((enrollment) => (
									<tr
										key={enrollment.id}
										className="border-b hover:bg-background-secondary"
									>
										<td className="px-4 py-3">
											<div>
												<div className="font-medium text-foreground text-sm">
													{enrollment.user.username}
												</div>
												<div className="text-foreground text-xs">
													{enrollment.user.email}
												</div>
											</div>
										</td>
										<td className="px-4 py-3">
											<div className="text-foreground text-sm">
												{enrollment.course.title}
											</div>
										</td>
										<td className="px-4 py-3">
											<span
												className={`inline-flex rounded-full px-2 py-1 font-semibold text-xs ${statusColors[enrollment.status]}`}
											>
												{enrollment.status.charAt(0).toUpperCase() +
													enrollment.status.slice(1)}
											</span>
										</td>
										<td className="px-4 py-3">
											<div className="text-gray-900 text-sm">
												{formatDate(enrollment.enrolled_at)}
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};
