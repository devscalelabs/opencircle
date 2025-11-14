import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { EnrollmentChartData } from "../../services/dashboard";

interface EnrollmentChartProps {
	data: EnrollmentChartData[];
	isLoading?: boolean;
}

export const EnrollmentChartComponent = ({
	data,
	isLoading,
}: EnrollmentChartProps) => {
	if (isLoading) {
		return (
			<div className="rounded-lg bg-background p-6 shadow">
				<h3 className="mb-4 font-semibold text-foreground text-lg">
					Enrollment Trends
				</h3>
				<div className="h-80 animate-pulse rounded bg-background-secondary"></div>
			</div>
		);
	}

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	};

	return (
		<div className="rounded-lg bg-background p-6 shadow">
			<h3 className="mb-4 font-semibold text-foreground text-lg">
				Enrollment Trends
			</h3>
			<ResponsiveContainer width="100%" height={320}>
				<LineChart
					data={data}
					margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis
						dataKey="date"
						tickFormatter={formatDate}
						tick={{ fontSize: 12 }}
					/>
					<YAxis tick={{ fontSize: 12 }} />
					<Tooltip
						labelFormatter={(value) => formatDate(value as string)}
						formatter={(value, name) => [
							value,
							name === "enrollments" ? "New Enrollments" : "Completions",
						]}
					/>
					<Legend
						formatter={(value) =>
							value === "enrollments" ? "New Enrollments" : "Completions"
						}
					/>
					<Line
						type="monotone"
						dataKey="enrollments"
						stroke="#3b82f6"
						strokeWidth={2}
						dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
						activeDot={{ r: 6 }}
					/>
					<Line
						type="monotone"
						dataKey="completions"
						stroke="#10b981"
						strokeWidth={2}
						dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
						activeDot={{ r: 6 }}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};
