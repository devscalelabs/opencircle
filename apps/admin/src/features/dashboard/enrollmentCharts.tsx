import {
	Bar,
	BarChart,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { EnrollmentChartData } from "../../services/dashboard";
import { ChartSkeleton } from "./chartSkeleton";

interface EnrollmentChartProps {
	data: EnrollmentChartData[];
	isLoading?: boolean;
}

export const EnrollmentChartComponent = ({
	data,
	isLoading,
}: EnrollmentChartProps) => {
	if (isLoading) {
		return <ChartSkeleton height={320} />;
	}

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	};

	return (
		<div className="rounded-lg bg-background-secondary p-6 shadow">
			<h3 className="mb-4 font-semibold text-foreground text-lg">
				Enrollment Trends
			</h3>
			<ResponsiveContainer width="100%" height={320}>
				<BarChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
					<XAxis
						dataKey="date"
						tickFormatter={formatDate}
						tick={{ fontSize: 12 }}
					/>
					<YAxis hide />
					<Tooltip
						labelFormatter={(value) => formatDate(value as string)}
						formatter={(value, name) => [
							value,
							name === "enrollments" ? "New Enrollments" : "Completions",
						]}
						contentStyle={{
							backgroundColor: "rgba(255, 255, 255, 0.95)",
							border: "1px solid #e5e7eb",
							borderRadius: "6px",
						}}
					/>
					<Legend
						formatter={(value) =>
							value === "enrollments" ? "New Enrollments" : "Completions"
						}
					/>
					<Bar
						dataKey="enrollments"
						fill="#6366f1"
						fillOpacity={0.8}
						radius={[4, 4, 0, 0]}
					/>
					<Bar
						dataKey="completions"
						fill="#818cf8"
						fillOpacity={0.6}
						radius={[4, 4, 0, 0]}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
};
