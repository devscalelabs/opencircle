import type { CourseEnrollmentDistribution } from "@opencircle/core";
import { useId } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { ChartSkeleton } from "./chartSkeleton";

interface CourseEnrollmentChartProps {
	data: CourseEnrollmentDistribution[];
	isLoading?: boolean;
}

export const CourseEnrollmentChart = ({
	data,
	isLoading,
}: CourseEnrollmentChartProps) => {
	const gradientId = useId();

	if (isLoading) {
		return <ChartSkeleton height={300} />;
	}

	const chartData = data.map((item) => ({
		name:
			item.courseTitle.length > 12
				? `${item.courseTitle.slice(0, 12)}...`
				: item.courseTitle,
		enrollments: item.enrollmentCount,
	}));

	const hasData = chartData.some((item) => item.enrollments > 0);

	return (
		<div className="rounded-lg bg-background-secondary p-6 shadow">
			<h3 className="mb-4 font-semibold text-foreground text-lg">
				Course Enrollment Distribution
			</h3>
			{hasData ? (
				<ResponsiveContainer width="100%" height={300}>
					<BarChart
						data={chartData}
						margin={{ top: 8, right: 12, bottom: 8, left: 0 }}
					>
						<defs>
							<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
								<stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
							</linearGradient>
						</defs>
						<CartesianGrid
							stroke="currentColor"
							strokeOpacity={0.08}
							vertical={false}
						/>
						<XAxis dataKey="name" tickLine={false} axisLine={false} />
						<YAxis tickLine={false} axisLine={false} />
						<Tooltip
							cursor={{ fill: "var(--background)", opacity: 0.5 }}
							contentStyle={{
								backgroundColor: "var(--background)",
								border: "1px solid var(--border)",
								borderRadius: 8,
							}}
							labelStyle={{ color: "var(--foreground)" }}
							itemStyle={{ color: "var(--foreground)" }}
						/>
						<Bar
							dataKey="enrollments"
							name="Enrollments"
							fill={`url(#${gradientId})`}
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ResponsiveContainer>
			) : (
				<div className="flex h-[300px] items-center justify-center text-foreground-secondary">
					No enrollment data available
				</div>
			)}
		</div>
	);
};
