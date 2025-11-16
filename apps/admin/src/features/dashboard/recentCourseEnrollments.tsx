import { format } from "date-fns";
import type { Enrollment } from "../../services/dashboard";
import { TableSkeleton } from "./tableSkeleton";

interface RecentEnrollmentsProps {
	enrollments: Enrollment[];
	isLoading?: boolean;
}

const statusColors = {
	active: "bg-blue-50 text-blue-700 border border-border",
	completed: "bg-green-50 text-green-700 border border-border",
	dropped: "bg-red-50 text-red-700 border border-border",
};

export const RecentEnrollmentsTable = ({
	enrollments,
	isLoading,
}: RecentEnrollmentsProps) => {
	if (isLoading) {
		return <TableSkeleton rowCount={5} showHeader={true} />;
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
		<div className="rounded-lg border border-border bg-background shadow-sm">
			<div className="border-border border-b px-6 py-4">
				<h3 className="font-semibold text-foreground text-lg">
					Recent Enrollments
				</h3>
			</div>
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-border">
					<thead className="bg-background-secondary/50">
						<tr>
							<th className="px-6 py-3 text-left font-semibold text-foreground text-xs uppercase tracking-wider">
								User
							</th>
							<th className="px-6 py-3 text-left font-semibold text-foreground text-xs uppercase tracking-wider">
								Course
							</th>
							<th className="px-6 py-3 text-left font-semibold text-foreground text-xs uppercase tracking-wider">
								Status
							</th>
							<th className="px-6 py-3 text-left font-semibold text-foreground text-xs uppercase tracking-wider">
								Enrolled
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border bg-background">
						{enrollments.length === 0 ? (
							<tr>
								<td
									colSpan={4}
									className="px-6 py-12 text-center text-foreground/60 text-sm"
								>
									No enrollments found
								</td>
							</tr>
						) : (
							enrollments.map((enrollment) => (
								<tr
									key={enrollment.id}
									className="transition-colors hover:bg-background-secondary/50"
								>
									<td className="px-6 py-4">
										<div className="flex flex-col">
											<span className="font-medium text-foreground text-sm">
												{enrollment.user.username}
											</span>
											<span className="text-foreground/60 text-xs">
												{enrollment.user.email}
											</span>
										</div>
									</td>
									<td className="px-6 py-4">
										<span className="text-foreground text-sm">
											{enrollment.course.title}
										</span>
									</td>
									<td className="px-6 py-4">
										<span
											className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${statusColors[enrollment.status]}`}
										>
											{enrollment.status.charAt(0).toUpperCase() +
												enrollment.status.slice(1)}
										</span>
									</td>
									<td className="px-6 py-4">
										<span className="text-foreground/80 text-sm">
											{formatDate(enrollment.enrolled_at)}
										</span>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};
