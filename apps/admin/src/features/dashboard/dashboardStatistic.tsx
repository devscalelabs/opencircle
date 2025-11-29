/** biome-ignore-all lint/suspicious/noArrayIndexKey: The index errors is fine since for skeleton! */

import {
	Activity01Icon,
	Book01Icon,
	CheckmarkCircle02Icon,
	UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { DashboardStats } from "@opencircle/core";
import { StatCardSkeleton } from "./statCardSkeleton";

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
			icon: UserMultiple02Icon,
			color: "text-foreground",
		},
		{
			title: "Total Courses",
			value: stats.totalCourses,
			icon: Book01Icon,
			color: "text-foreground",
		},
		{
			title: "Active Enrollments",
			value: stats.activeEnrollments,
			icon: Activity01Icon,
			color: "text-foreground",
		},
		{
			title: "Total Enrollments",
			value: stats.totalEnrollments,
			icon: CheckmarkCircle02Icon,
			color: "text-foreground",
		},
	];

	if (isLoading) {
		return <StatCardSkeleton cardCount={4} />;
	}

	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			{cards.map((card, index) => {
				const Icon = card.icon;
				return (
					<div
						key={`stat-${index}-${card.title}`}
						className="rounded-lg bg-background-secondary p-6 shadow"
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
							<div className="rounded-lg p-3">
								<HugeiconsIcon
									icon={Icon}
									className={`h-6 w-6 ${card.color}`}
								/>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};
