import { Button } from "@opencircle/ui";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format, subDays } from "date-fns";
import { Activity, Clock, TrendingUp, Users } from "lucide-react";
import { useMemo, useState } from "react";
import {
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
} from "recharts";
import { METADATA } from "../../../constants/metadata";
import { api } from "../../../utils/api";

export const Route = createFileRoute("/_dashboardLayout/activity/")({
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

	const { startDate, endDate } = useMemo(() => {
		const end = new Date();
		const start = subDays(end, dateRange);
		return {
			startDate: start.toISOString(),
			endDate: end.toISOString(),
		};
	}, [dateRange]);

	const { data: stats } = useQuery({
		queryKey: ["presence", "stats"],
		queryFn: () => api.presence.getStats(),
		staleTime: 5 * 60 * 1000,
	});

	const { data: timeseries } = useQuery({
		queryKey: ["presence", "timeseries", startDate, endDate],
		queryFn: () => api.presence.getTimeseries(startDate, endDate, "day"),
		staleTime: 5 * 60 * 1000,
	});

	const { data: activeUsers } = useQuery({
		queryKey: ["presence", "active"],
		queryFn: () => api.presence.getActiveNow(),
		refetchInterval: 30000,
		staleTime: 30000,
	});

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-medium text-2xl text-foreground">
						User Activity
					</h1>
				</div>
				<div className="flex gap-2">
					<Button
						type="button"
						onClick={() => setDateRange(7)}
						size="sm"
						variant={dateRange === 7 ? "primary" : "secondary"}
					>
						Last 7 days
					</Button>
					<Button
						type="button"
						onClick={() => setDateRange(14)}
						size="sm"
						variant={dateRange === 14 ? "primary" : "secondary"}
					>
						Last 14 days
					</Button>
					<Button
						type="button"
						onClick={() => setDateRange(30)}
						size="sm"
						variant={dateRange === 30 ? "primary" : "secondary"}
					>
						Last 30 days
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg bg-background-secondary p-6 shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-foreground text-sm">
								Total Sessions
							</p>
							<p className="mt-2 font-bold text-2xl text-foreground">
								{stats?.total_sessions || 0}
							</p>
						</div>
						<div>
							<Activity className="h-6 w-6 text-foreground" />
						</div>
					</div>
				</div>
				<div className="rounded-lg bg-background-secondary p-6 shadow">
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
						<div>
							<Users className="h-6 w-6 text-foreground" />
						</div>
					</div>
				</div>
				<div className="rounded-lg bg-background-secondary p-6 shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-foreground text-sm">
								Unique Users
							</p>
							<p className="mt-2 font-bold text-2xl text-foreground">
								{stats?.unique_users || 0}
							</p>
						</div>
						<div>
							<TrendingUp className="h-6 w-6 text-foreground" />
						</div>
					</div>
				</div>
				<div className="rounded-lg bg-background-secondary p-6 shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-foreground text-sm">
								Avg Duration
							</p>
							<p className="mt-2 font-bold text-2xl text-foreground">
								{Math.round(stats?.average_duration_seconds || 0)}s
							</p>
						</div>
						<div>
							<Clock className="h-6 w-6 text-foreground" />
						</div>
					</div>
				</div>
			</div>

			{/* Combined Chart */}
			<div className="rounded-lg bg-background-secondary p-6 shadow">
				<h3 className="mb-4 font-semibold text-foreground text-lg">
					Activity Overview
				</h3>
				<ResponsiveContainer width="100%" height={400}>
					<LineChart data={timeseries?.data || []}>
						<XAxis
							dataKey="timestamp"
							tickFormatter={(value) => format(new Date(value), "MMM dd")}
						/>
						<Tooltip
							labelFormatter={(value) =>
								format(new Date(value as string), "PPP")
							}
							formatter={(value: number, name: string) => {
								if (name === "Total Duration") {
									return [`${Math.round(value / 60)}m`, name];
								}
								if (name === "Avg Duration") {
									return [`${Math.round(value)}s`, name];
								}
								return [value, name];
							}}
						/>
						<Legend />
						<Line
							yAxisId="left"
							type="monotone"
							dataKey="session_count"
							name="Sessions"
							stroke="#8884d8"
							strokeWidth={2}
						/>
						<Line
							yAxisId="left"
							type="monotone"
							dataKey="unique_users"
							name="Unique Users"
							stroke="#82ca9d"
							strokeWidth={2}
						/>
						<Line
							yAxisId="right"
							type="monotone"
							dataKey="average_duration_seconds"
							name="Avg Duration"
							stroke="#ffc658"
							strokeWidth={2}
						/>
						<Line
							yAxisId="right"
							type="monotone"
							dataKey="total_duration_seconds"
							name="Total Duration"
							stroke="#ff7300"
							strokeWidth={2}
						/>
					</LineChart>
				</ResponsiveContainer>
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
