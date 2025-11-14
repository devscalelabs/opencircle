/** biome-ignore-all lint/suspicious/noArrayIndexKey: The index errors is fine since for skeleton! */
import { Activity, BookOpen, CheckCircle, Users } from "lucide-react";
import type { DashboardStats } from "../../services/dashboard";

interface DashboardStatsProps {
	stats: DashboardStats;
	isLoading?: boolean;
}

export const DashboardStatsCards = ({
	stats,
	isLoading,
}: DashboardStatsProps) => {
	const cards = [
		{
			title: "Total Users",
			value: stats.totalUsers,
			icon: Users,
			color: "text-foreground",
			bgColor: "bg-background",
		},
		{
			title: "Total Courses",
			value: stats.totalCourses,
			icon: BookOpen,
			color: "text-foreground",
			bgColor: "bg-background",
		},
		{
			title: "Active Enrollments",
			value: stats.activeEnrollments,
			icon: Activity,
			color: "text-foreground",
			bgColor: "bg-background",
		},
		{
			title: "Total Enrollments",
			value: stats.totalEnrollments,
			icon: CheckCircle,
			color: "text-foreground",
			bgColor: "bg-background",
		},
	];

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{[...Array(4)].map((_, i) => (
					<div
						key={`skeleton-stat-card-${i}`}
						className="animate-pulse rounded-lg bg-background p-6 shadow"
					>
						<div className="flex items-center justify-between">
							<div className="space-y-2">
								<div className="h-4 w-24 rounded bg-background-secondary"></div>
								<div className="h-8 w-16 rounded bg-background-secondary"></div>
							</div>
							<div className="h-12 w-12 rounded-lg bg-background-secondary"></div>
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			{cards.map((card, index) => {
				const Icon = card.icon;
				return (
					<div
						key={`stat-${index}-${card.title}`}
						className="rounded-lg bg-background p-6 shadow"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-foreground text-sm">
									{card.title}
								</p>
								<p className="mt-2 font-bold text-2xl text-foreground">
									{card.value.toLocaleString()}
								</p>
							</div>
							<div className={`rounded-lg p-3 ${card.bgColor}`}>
								<Icon className={`h-6 w-6 ${card.color}`} />
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};
