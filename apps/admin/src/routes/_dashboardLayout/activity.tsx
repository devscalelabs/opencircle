import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format, subDays } from "date-fns";
import { Activity, Clock, TrendingUp, Users } from "lucide-react";
import { useMemo, useState } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { METADATA } from "../../constants/metadata";
import { api } from "../../utils/api";

export const Route = createFileRoute("/_dashboardLayout/activity")({
	head: () => ({
		meta: [
			{
				title: "Activity - OpenCircle Admin",
			},
			{
				name: "description",
				content: "View user activity and presence analytics",
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
	const [dateRange, setDateRange] = useState<7 | 14 | 30>(7);

	// Use useMemo to prevent date recreation on every render
	const { startDate, endDate } = useMemo(() => {
		const end = new Date();
		const start = subDays(end, dateRange);
		return {
			startDate: start.toISOString(),
			endDate: end.toISOString(),
		};
	}, [dateRange]); // Recalculate when date range changes

	// Fetch presence stats
	const { data: stats } = useQuery({
		queryKey: ["presence", "stats"],
		queryFn: () => api.presence.getStats(),
		staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
	});

	// Fetch timeseries data
	const { data: timeseries } = useQuery({
		queryKey: ["presence", "timeseries", startDate, endDate],
		queryFn: () => api.presence.getTimeseries(startDate, endDate, "day"),
		staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
	});

	// Fetch active users
	const { data: activeUsers } = useQuery({
		queryKey: ["presence", "active"],
		queryFn: () => api.presence.getActiveNow(),
		refetchInterval: 30000, // Refresh every 30 seconds
		staleTime: 30000, // Match refetch interval
	});

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl text-foreground">User Activity</h1>
					<p className="text-foreground">
						Monitor user presence and engagement metrics
					</p>
				</div>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => setDateRange(7)}
						className={`rounded-lg px-4 py-2 font-medium text-sm transition-colors ${
							dateRange === 7
								? "bg-foreground text-background"
								: "bg-background text-foreground hover:bg-background-secondary"
						}`}
					>
						Last 7 days
					</button>
					<button
						type="button"
						onClick={() => setDateRange(14)}
						className={`rounded-lg px-4 py-2 font-medium text-sm transition-colors ${
							dateRange === 14
								? "bg-foreground text-background"
								: "bg-background text-foreground hover:bg-background-secondary"
						}`}
					>
						Last 14 days
					</button>
					<button
						type="button"
						onClick={() => setDateRange(30)}
						className={`rounded-lg px-4 py-2 font-medium text-sm transition-colors ${
							dateRange === 30
								? "bg-foreground text-background"
								: "bg-background text-foreground hover:bg-background-secondary"
						}`}
					>
						Last 30 days
					</button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg bg-background p-6 shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-foreground text-sm">
								Total Sessions
							</p>
							<p className="mt-2 font-bold text-2xl text-foreground">
								{stats?.total_sessions || 0}
							</p>
						</div>
						<div className="rounded-lg bg-background p-3">
							<Activity className="h-6 w-6 text-foreground" />
						</div>
					</div>
				</div>
				<div className="rounded-lg bg-background p-6 shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-foreground text-sm">Active Now</p>
							<p className="mt-2 font-bold text-2xl text-foreground">
								{activeUsers?.active_count || 0}
							</p>
							<div className="mt-1 flex items-center gap-1 text-green-600 text-xs">
								<div className="h-2 w-2 animate-pulse rounded-full bg-green-600" />
								Live
							</div>
						</div>
						<div className="rounded-lg bg-background p-3">
							<Users className="h-6 w-6 text-foreground" />
						</div>
					</div>
				</div>
				<div className="rounded-lg bg-background p-6 shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-foreground text-sm">
								Unique Users
							</p>
							<p className="mt-2 font-bold text-2xl text-foreground">
								{stats?.unique_users || 0}
							</p>
						</div>
						<div className="rounded-lg bg-background p-3">
							<TrendingUp className="h-6 w-6 text-foreground" />
						</div>
					</div>
				</div>
				<div className="rounded-lg bg-background p-6 shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-foreground text-sm">
								Avg Duration
							</p>
							<p className="mt-2 font-bold text-2xl text-foreground">
								{Math.round(stats?.average_duration_seconds || 0)}s
							</p>
						</div>
						<div className="rounded-lg bg-background p-3">
							<Clock className="h-6 w-6 text-foreground" />
						</div>
					</div>
				</div>
			</div>

			{/* Charts */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Session Count Over Time */}
				<div className="rounded-lg bg-background p-6 shadow">
					<h3 className="mb-4 font-semibold text-foreground text-lg">
						Session Activity
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<AreaChart data={timeseries?.data || []}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="timestamp"
								tickFormatter={(value) => format(new Date(value), "MMM dd")}
							/>
							<YAxis />
							<Tooltip
								labelFormatter={(value) =>
									format(new Date(value as string), "PPP")
								}
							/>
							<Legend />
							<Area
								type="monotone"
								dataKey="session_count"
								name="Sessions"
								stroke="#8884d8"
								fill="#8884d8"
								fillOpacity={0.6}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>

				{/* Unique Users Over Time */}
				<div className="rounded-lg bg-background p-6 shadow">
					<h3 className="mb-4 font-semibold text-foreground text-lg">
						Unique Users
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={timeseries?.data || []}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="timestamp"
								tickFormatter={(value) => format(new Date(value), "MMM dd")}
							/>
							<YAxis />
							<Tooltip
								labelFormatter={(value) =>
									format(new Date(value as string), "PPP")
								}
							/>
							<Legend />
							<Line
								type="monotone"
								dataKey="unique_users"
								name="Unique Users"
								stroke="#82ca9d"
								strokeWidth={2}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>

				{/* Average Duration */}
				<div className="rounded-lg bg-background p-6 shadow">
					<h3 className="mb-4 font-semibold text-foreground text-lg">
						Average Session Duration
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={timeseries?.data || []}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="timestamp"
								tickFormatter={(value) => format(new Date(value), "MMM dd")}
							/>
							<YAxis />
							<Tooltip
								labelFormatter={(value) =>
									format(new Date(value as string), "PPP")
								}
								formatter={(value: number) => `${Math.round(value)}s`}
							/>
							<Legend />
							<Bar
								dataKey="average_duration_seconds"
								name="Avg Duration (s)"
								fill="#ffc658"
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>

				{/* Total Duration */}
				<div className="rounded-lg bg-background p-6 shadow">
					<h3 className="mb-4 font-semibold text-foreground text-lg">
						Total Time Spent
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<AreaChart data={timeseries?.data || []}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="timestamp"
								tickFormatter={(value) => format(new Date(value), "MMM dd")}
							/>
							<YAxis />
							<Tooltip
								labelFormatter={(value) =>
									format(new Date(value as string), "PPP")
								}
								formatter={(value: number) => `${Math.round(value / 60)}m`}
							/>
							<Legend />
							<Area
								type="monotone"
								dataKey="total_duration_seconds"
								name="Total Duration (s)"
								stroke="#ff7300"
								fill="#ff7300"
								fillOpacity={0.6}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Active Users List */}
			{activeUsers && activeUsers.active_count > 0 && (
				<div className="rounded-lg bg-background p-6 shadow">
					<h3 className="mb-4 font-semibold text-foreground text-lg">
						Currently Active Users ({activeUsers.active_count})
					</h3>
					<div className="space-y-2">
						{activeUsers.active_users.map((user) => (
							<div
								key={user.connection_id}
								className="flex items-center justify-between rounded-lg bg-background-secondary p-3"
							>
								<div>
									<p className="font-medium text-foreground">
										{user.name || user.username}
									</p>
									<p className="text-foreground text-sm">
										@{user.username} • Connected:{" "}
										{format(new Date(user.connected_at), "PPp")}
									</p>
								</div>
								<div className="text-right">
									<p className="font-medium text-foreground text-sm">
										{Math.round(user.duration_seconds / 60)}m{" "}
										{Math.round(user.duration_seconds % 60)}s
									</p>
									<div className="flex items-center gap-1 text-green-600 text-xs">
										<div className="h-2 w-2 animate-pulse rounded-full bg-green-600" />
										Live
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
