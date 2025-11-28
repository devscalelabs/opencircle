import type {
	CourseEnrollmentDistribution,
	DashboardStats,
	UserGrowthData,
} from "@opencircle/core";
import { Button } from "@opencircle/ui";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import {
	BookOpen,
	FileText,
	Hash,
	Link as LinkIcon,
	Users,
	Zap,
} from "lucide-react";
import { useId } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { METADATA } from "../../../constants/metadata";
import { CourseEnrollmentChart } from "../../../features/dashboard/courseEnrollmentChart";
import { UserGrowthChart } from "../../../features/dashboard/userGrowthChart";
import { api } from "../../../utils/api";

export const Route = createFileRoute("/_dashboardLayout/dashboard/")({
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
	const usersGradientId = useId();
	const sessionsGradientId = useId();
	// Fetch key platform data
	const { data: dashboardStats, isLoading: statsLoading } =
		useQuery<DashboardStats>({
			queryKey: ["dashboard-stats"],
			queryFn: () => api.courses.getDashboardStats(),
		});

	const { data: channels = [], isLoading: channelsLoading } = useQuery({
		queryKey: ["channels", "dashboard"],
		queryFn: () => api.channels.getAll(0, 1000),
	});

	const { data: articles = [], isLoading: articlesLoading } = useQuery({
		queryKey: ["articles", "dashboard"],
		queryFn: () => api.articles.getAll(0, 1000),
	});

	const { data: resources = [], isLoading: resourcesLoading } = useQuery({
		queryKey: ["resources", "dashboard"],
		queryFn: () => api.resources.getAll(0, 1000),
	});

	const { data: activityStats } = useQuery({
		queryKey: ["presence", "stats"],
		queryFn: () => api.presence.getStats(),
		staleTime: 5 * 60 * 1000,
	});

	const { data: activeUsers } = useQuery({
		queryKey: ["presence", "active"],
		queryFn: () => api.presence.getActiveNow(),
		refetchInterval: 30000,
		staleTime: 30000,
	});

	const { data: timeseries } = useQuery({
		queryKey: ["presence", "timeseries", "7-days"],
		queryFn: () => {
			const end = new Date();
			const start = new Date();
			start.setDate(end.getDate() - 7);
			return api.presence.getTimeseries(
				start.toISOString(),
				end.toISOString(),
				"day",
			);
		},
		staleTime: 5 * 60 * 1000,
	});

	const { data: courseEnrollmentData, isLoading: courseEnrollmentLoading } =
		useQuery<CourseEnrollmentDistribution[]>({
			queryKey: ["dashboard", "course-enrollment-distribution"],
			queryFn: () => api.courses.getCourseEnrollmentDistribution(5),
			staleTime: 5 * 60 * 1000,
		});

	const { data: userGrowthData, isLoading: userGrowthLoading } = useQuery<
		UserGrowthData[]
	>({
		queryKey: ["dashboard", "user-growth"],
		queryFn: () => api.courses.getUserGrowthData(30),
		staleTime: 5 * 60 * 1000,
	});

	const isLoading =
		statsLoading || channelsLoading || articlesLoading || resourcesLoading;

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="font-medium text-2xl text-foreground">Dashboard</h1>
				</div>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className="animate-pulse rounded-lg bg-background-secondary p-6 shadow"
						>
							<div className="mb-2 h-4 rounded bg-background"></div>
							<div className="h-8 rounded bg-background"></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	// Calculate content stats
	const totalContent =
		(dashboardStats?.totalCourses || 0) +
		articles.length +
		channels.length +
		resources.length;

	// Prepare chart data
	const chartData =
		timeseries?.data?.slice(-7).map((item) => ({
			date: format(new Date(item.timestamp), "MMM dd"),
			users: item.unique_users,
			sessions: item.session_count,
		})) || [];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="font-medium text-2xl text-foreground">Dashboard</h1>
			</div>

			{/* Key Metrics Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Link
					to="/users"
					className="rounded-lg bg-background-secondary p-6 shadow transition hover:shadow-md"
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-foreground text-sm">Total Users</p>
							<p className="mt-2 font-bold text-3xl text-foreground">
								{dashboardStats?.totalUsers || 0}
							</p>
							{activeUsers && (
								<p className="mt-1 text-green-600 text-sm">
									{activeUsers.active_count} active now
								</p>
							)}
						</div>
						<div className="p-3">
							<Users className="h-6 w-6 text-foreground" />
						</div>
					</div>
				</Link>

				<Link
					to="/courses"
					className="rounded-lg bg-background-secondary p-6 shadow transition hover:shadow-md"
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-foreground text-sm">Courses</p>
							<p className="mt-2 font-bold text-3xl text-foreground">
								{dashboardStats?.totalCourses || 0}
							</p>
							<p className="mt-1 text-foreground-secondary text-sm">
								{dashboardStats?.totalCourses || 0} total
							</p>
						</div>
						<div className="p-3">
							<BookOpen className="h-6 w-6 text-foreground" />
						</div>
					</div>
				</Link>

				<Link
					to="/channels"
					className="rounded-lg bg-background-secondary p-6 shadow transition hover:shadow-md"
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-foreground text-sm">Channels</p>
							<p className="mt-2 font-bold text-3xl text-foreground">
								{channels.length}
							</p>
							<p className="mt-1 text-foreground-secondary text-sm">
								Community spaces
							</p>
						</div>
						<div className="p-3">
							<Hash className="h-6 w-6 text-foreground" />
						</div>
					</div>
				</Link>

				<div className="rounded-lg bg-background-secondary p-6 shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-foreground text-sm">
								Total Content
							</p>
							<p className="mt-2 font-bold text-3xl text-foreground">
								{totalContent}
							</p>
							<p className="mt-1 text-foreground-secondary text-sm">
								All platform content
							</p>
						</div>
						<div className="p-3">
							<FileText className="h-6 w-6 text-foreground" />
						</div>
					</div>
				</div>
			</div>

			{/* Activity Chart */}
			<div className="rounded-lg bg-background-secondary p-6 shadow">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="font-semibold text-foreground text-lg">
						7-Day Activity Overview
					</h3>
					<Link to="/activity" className="text-primary text-sm hover:underline">
						View detailed activity →
					</Link>
				</div>
				{chartData.length > 0 ? (
					<ResponsiveContainer width="100%" height={300}>
						<AreaChart
							data={chartData}
							margin={{ top: 8, right: 12, bottom: 8, left: 0 }}
						>
							<defs>
								<linearGradient
									id={usersGradientId}
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
									<stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
								</linearGradient>
								<linearGradient
									id={sessionsGradientId}
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop offset="0%" stopColor="#818cf8" stopOpacity={0.25} />
									<stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid
								stroke="currentColor"
								strokeOpacity={0.08}
								vertical={false}
							/>
							<XAxis dataKey="date" tickLine={false} axisLine={false} />
							<YAxis tickLine={false} axisLine={false} />
							<Tooltip
								cursor={{ stroke: "#4b5563", strokeDasharray: "3 3" }}
								contentStyle={{
									backgroundColor: "var(--background)",
									border: "1px solid var(--border)",
									borderRadius: 8,
								}}
								labelStyle={{ color: "var(--foreground)" }}
								itemStyle={{ color: "var(--foreground)" }}
							/>
							<Legend />
							<Area
								type="linear"
								dataKey="users"
								name="Unique Users"
								stroke="#6366f1"
								strokeWidth={2}
								fill={`url(#${usersGradientId})`}
								dot={false}
								activeDot={{ r: 4 }}
							/>
							<Area
								type="linear"
								dataKey="sessions"
								name="Sessions"
								stroke="#818cf8"
								strokeWidth={2}
								fill={`url(#${sessionsGradientId})`}
								dot={false}
								activeDot={{ r: 4 }}
							/>
						</AreaChart>
					</ResponsiveContainer>
				) : (
					<div className="flex h-[300px] items-center justify-center text-foreground-secondary">
						No activity data available
					</div>
				)}
			</div>

			{/* Course Enrollment & User Growth Charts */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<CourseEnrollmentChart
					data={courseEnrollmentData || []}
					isLoading={courseEnrollmentLoading}
				/>
				<UserGrowthChart
					data={userGrowthData || []}
					isLoading={userGrowthLoading}
				/>
			</div>

			{/* Quick Stats & Links */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Activity Stats */}
				<div className="rounded-lg bg-background-secondary p-6 shadow">
					<h3 className="mb-4 font-semibold text-foreground text-lg">
						Activity Stats
					</h3>
					<div className="space-y-3">
						<div className="flex justify-between">
							<span className="text-foreground-secondary">Total Sessions</span>
							<span className="font-medium text-foreground">
								{activityStats?.total_sessions || 0}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-foreground-secondary">Avg Duration</span>
							<span className="font-medium text-foreground">
								{Math.round(activityStats?.average_duration_seconds || 0)}s
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-foreground-secondary">Unique Users</span>
							<span className="font-medium text-foreground">
								{activityStats?.unique_users || 0}
							</span>
						</div>
					</div>
				</div>

				{/* Content Breakdown */}
				<div className="rounded-lg bg-background-secondary p-6 shadow">
					<h3 className="mb-4 font-semibold text-foreground text-lg">
						Content Breakdown
					</h3>
					<div className="space-y-3">
						<div className="flex justify-between">
							<span className="text-foreground-secondary">Articles</span>
							<span className="font-medium text-foreground">
								{articles.length}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-foreground-secondary">Resources</span>
							<span className="font-medium text-foreground">
								{resources.length}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-foreground-secondary">Total Courses</span>
							<span className="font-medium text-foreground">
								{dashboardStats?.totalCourses || 0}
							</span>
						</div>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="rounded-lg bg-background-secondary p-6 shadow">
					<h3 className="mb-4 font-semibold text-foreground text-lg">
						Quick Actions
					</h3>
					<div className="space-y-2">
						<Link to="/courses/new" className="block">
							<Button variant="secondary" className="w-full justify-start">
								<BookOpen size={16} />
								<span>Create Course</span>
							</Button>
						</Link>
						<Link to="/channels" className="block">
							<Button variant="secondary" className="w-full justify-start">
								<Hash size={16} />
								<span>Manage Channels</span>
							</Button>
						</Link>
						<Link to="/invite-codes/new" className="block">
							<Button variant="secondary" className="w-full justify-start">
								<Zap size={16} />
								<span>Generate Invite</span>
							</Button>
						</Link>
						<Link to="/app-settings" className="block">
							<Button variant="secondary" className="w-full justify-start">
								<LinkIcon size={16} />
								<span>App Settings</span>
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
