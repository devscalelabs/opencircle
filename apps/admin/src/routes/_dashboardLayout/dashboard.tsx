import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardStatsCards } from "../../components/dashboard/DashboardStats";
import { EnrollmentChartComponent } from "../../components/dashboard/EnrollmentChart";
import { RecentEnrollmentsTable } from "../../components/dashboard/RecentEnrollments";
import { METADATA } from "../../constants/metadata";
import { dashboardService } from "../../services/dashboard";

export const Route = createFileRoute("/_dashboardLayout/dashboard")({
	head: () => ({
		meta: [
			{
				title: "Dashboard - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Admin Dashboard Overview",
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
		queryFn: () => dashboardService.getEnrollmentChartData(30),
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
				<div className="rounded-lg border border-red-200 bg-background-secondary p-4">
					<h3 className="font-medium text-foreground">
						Error loading dashboard data
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
				<h1 className="font-bold text-2xl text-foreground">Dashboard</h1>
				<p className="text-foreground">
					Overview of your platform's performance
				</p>
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

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<EnrollmentChartComponent
					data={chartData || []}
					isLoading={chartLoading}
				/>
				<div className="rounded-lg bg-background p-6 shadow">
					<h3 className="mb-4 font-semibold text-foreground text-lg">
						Quick Stats
					</h3>
					<div className="space-y-4">
						<div className="flex items-center justify-between rounded bg-background-secondary p-3">
							<span className="text-foreground text-sm">Total Enrollments</span>
							<span className="font-semibold text-foreground">
								{stats?.totalEnrollments?.toLocaleString() || 0}
							</span>
						</div>
						<div className="flex items-center justify-between rounded bg-background-secondary p-3">
							<span className="text-foreground text-sm">Completion Rate</span>
							<span className="font-semibold text-foreground">
								{stats?.totalEnrollments
									? Math.round(
											(stats.completedEnrollments / stats.totalEnrollments) *
												100,
										)
									: 0}
								%
							</span>
						</div>
						<div className="flex items-center justify-between rounded bg-background-secondary p-3">
							<span className="text-foreground text-sm">Active Users</span>
							<span className="font-semibold text-foreground">
								{stats?.totalUsers?.toLocaleString() || 0}
							</span>
						</div>
						<div className="flex items-center justify-between rounded bg-background-secondary p-3">
							<span className="text-foreground text-sm">Published Courses</span>
							<span className="font-semibold text-foreground">
								{stats?.totalCourses?.toLocaleString() || 0}
							</span>
						</div>
					</div>
				</div>
			</div>

			<RecentEnrollmentsTable
				enrollments={enrollments || []}
				isLoading={enrollmentsLoading}
			/>
		</div>
	);
}
