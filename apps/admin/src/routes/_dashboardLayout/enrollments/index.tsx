import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { METADATA } from "../../../constants/metadata";
import { DashboardStatsCards } from "../../../features/dashboard/dashboardStatistic";
import { EnrollmentChartComponent } from "../../../features/dashboard/enrollmentCharts";
import { RecentEnrollmentsTable } from "../../../features/dashboard/recentCourseEnrollments";
import { dashboardService } from "../../../services/dashboard";

export const Route = createFileRoute("/_dashboardLayout/enrollments/")({
	head: () => ({
		meta: [
			{
				title: "Enrollments - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Manage and view course enrollments",
			},
		],
		links: [
			{
				rel: "icon",
				href: METADATA.favicon,
			},
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const {
		data: stats,
		isLoading: statsLoading,
		error: statsError,
	} = useQuery({
		queryKey: ["dashboard-stats"],
		queryFn: dashboardService.getDashboardStats,
	});

	const {
		data: chartData,
		isLoading: chartLoading,
		error: chartError,
	} = useQuery({
		queryKey: ["dashboard-chart"],
		queryFn: () => dashboardService.getEnrollmentChartData(7),
	});

	const {
		data: enrollments,
		isLoading: enrollmentsLoading,
		error: enrollmentsError,
	} = useQuery({
		queryKey: ["dashboard-enrollments"],
		queryFn: () => dashboardService.getEnrollments(10),
	});

	if (statsError || chartError || enrollmentsError) {
		return (
			<div className="p-6">
				<div className="rounded-lg border border-border bg-background-secondary p-4">
					<h3 className="font-medium text-foreground">
						Error loading enrollment data
					</h3>
					<p className="mt-1 text-foreground text-sm">
						Please try refreshing the page or check your connection.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-medium text-2xl text-foreground">Enrollments</h1>
			</div>

			<DashboardStatsCards
				stats={
					stats || {
						totalUsers: 0,
						totalCourses: 0,
						activeEnrollments: 0,
						completedEnrollments: 0,
						totalEnrollments: 0,
					}
				}
				isLoading={statsLoading}
			/>

			<EnrollmentChartComponent
				data={chartData || []}
				isLoading={chartLoading}
			/>

			<RecentEnrollmentsTable
				enrollments={enrollments || []}
				isLoading={enrollmentsLoading}
			/>
		</div>
	);
}
