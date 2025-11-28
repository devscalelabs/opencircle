import type { UserGrowthData } from "@opencircle/core";
import { format } from "date-fns";
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

import { ChartSkeleton } from "./chartSkeleton";

interface UserGrowthChartProps {
	data: UserGrowthData[];
	isLoading?: boolean;
}

export const UserGrowthChart = ({ data, isLoading }: UserGrowthChartProps) => {
	const newUsersGradientId = useId();
	const cumulativeGradientId = useId();

	if (isLoading) {
		return <ChartSkeleton height={300} />;
	}

	const chartData = data.map((item) => ({
		date: format(new Date(item.date), "MMM dd"),
		"New Users": item.newUsers,
		"Total Users": item.cumulativeUsers,
	}));

	const hasData = chartData.length > 0;

	return (
		<div className="rounded-lg bg-background-secondary p-6 shadow outline-none focus:outline-none">
			<h3 className="mb-4 font-semibold text-foreground text-lg">
				User Growth Over Time
			</h3>
			{hasData ? (
				<ResponsiveContainer width="100%" height={300}>
					<AreaChart
						data={chartData}
						margin={{ top: 8, right: 12, bottom: 8, left: 0 }}
					>
						<defs>
							<linearGradient
								id={newUsersGradientId}
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
								<stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
							</linearGradient>
							<linearGradient
								id={cumulativeGradientId}
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
								<stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
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
							dataKey="New Users"
							stroke="#6366f1"
							strokeWidth={2}
							fill={`url(#${newUsersGradientId})`}
							dot={false}
							activeDot={{ r: 4 }}
						/>
						<Area
							type="linear"
							dataKey="Total Users"
							stroke="#22c55e"
							strokeWidth={2}
							fill={`url(#${cumulativeGradientId})`}
							dot={false}
							activeDot={{ r: 4 }}
						/>
					</AreaChart>
				</ResponsiveContainer>
			) : (
				<div className="flex h-[300px] items-center justify-center text-foreground-secondary">
					No user growth data available
				</div>
			)}
		</div>
	);
};
