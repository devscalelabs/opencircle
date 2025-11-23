import type { EnrollmentChartData } from "@opencircle/core";
import { format } from "date-fns";
import { useId } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { ChartSkeleton } from "./chartSkeleton";

interface EnrollmentChartProps {
	data: EnrollmentChartData[];
	isLoading?: boolean;
}

export const EnrollmentChartComponent = ({
	data,
	isLoading,
}: EnrollmentChartProps) => {
	const gradientId = useId();

	if (isLoading) {
		return <ChartSkeleton height={400} />;
	}

	return (
		<div className="rounded-lg bg-background-secondary p-6 shadow">
			<h3 className="mb-4 font-semibold text-foreground text-lg">
				Daily Enrollment Trends
			</h3>
			<ResponsiveContainer width="100%" height={400}>
				<AreaChart
					data={data}
					margin={{ top: 8, right: 12, bottom: 8, left: 0 }}
				>
					<defs>
						<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
							<stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
						</linearGradient>
					</defs>
					<CartesianGrid
						stroke="currentColor"
						strokeOpacity={0.08}
						vertical={false}
					/>
					<XAxis
						dataKey="date"
						tickLine={false}
						axisLine={false}
						tickFormatter={(value) => format(new Date(value), "MMM dd")}
					/>
					<YAxis tickLine={false} axisLine={false} />
					<Tooltip
						cursor={{ stroke: "#4b5563", strokeDasharray: "3 3" }}
						contentStyle={{
							backgroundColor: "var(--background)",
							border: "1px solid var(--border)",
							borderRadius: 8,
						}}
						labelStyle={{ color: "var(--foreground)" }}
						labelFormatter={(value) => format(new Date(value as string), "PPP")}
						formatter={(value) => [value, "Enrollments"]}
					/>
					<Area
						type="linear"
						dataKey="total"
						name="Enrollments"
						stroke="#6366f1"
						strokeWidth={2}
						fill={`url(#${gradientId})`}
						dot={false}
						activeDot={{ r: 4 }}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
};
