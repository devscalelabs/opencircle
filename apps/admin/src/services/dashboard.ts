import { api } from "../utils/api";

export interface Enrollment {
	id: string;
	user_id: string;
	course_id: string;
	status: "active" | "completed" | "dropped";
	enrolled_at: string | null;
	completed_at: string | null;
	user: {
		id: string;
		username: string;
		name: string | null;
		email: string;
	};
	course: {
		id: string;
		title: string;
		description: string | null;
		status: "draft" | "published" | "archived";
	};
	created_at: string;
	updated_at: string;
}

export interface DashboardStats {
	totalUsers: number;
	totalCourses: number;
	activeEnrollments: number;
	completedEnrollments: number;
	totalEnrollments: number;
}

export interface EnrollmentChartData {
	date: string;
	enrollments: number;
	completions: number;
}

export const dashboardService = {
	async getEnrollments(limit = 50): Promise<Enrollment[]> {
		// Get enrollments and courses in parallel
		const [enrollments, courses] = await Promise.all([
			api.courses.getAllEnrollments(undefined, undefined, undefined, 0, limit),
			api.courses.getAllCourses(0, 1000, undefined, undefined),
		]);

		// Create a course map for quick lookup
		const courseMap = new Map(
			courses.map((course: any) => [course.id, course]),
		);

		// Map enrollments with course data
		return enrollments.map((enrollment: any) => ({
			...enrollment,
			course: courseMap.get(enrollment.course_id) || {
				id: enrollment.course_id,
				title: "Unknown Course",
				description: null,
				status: "draft" as const,
			},
		})) as Enrollment[];
	},

	async getDashboardStats(): Promise<DashboardStats> {
		// Get all data to calculate stats
		const [enrollments, courses] = await Promise.all([
			api.courses.getAllEnrollments(undefined, undefined, undefined, 0, 1000),
			api.courses.getAllCourses(0, 1000, undefined, undefined),
		]);

		const totalEnrollments = enrollments.length;
		const activeEnrollments = enrollments.filter(
			(e: any) => e.status === "active",
		).length;
		const completedEnrollments = enrollments.filter(
			(e: any) => e.status === "completed",
		).length;
		const totalCourses = courses.length;

		// Get unique users from enrollments
		const uniqueUsers = new Set(enrollments.map((e: any) => e.user_id)).size;

		return {
			totalUsers: uniqueUsers,
			totalCourses,
			activeEnrollments,
			completedEnrollments,
			totalEnrollments,
		};
	},

	async getEnrollmentChartData(days = 30): Promise<EnrollmentChartData[]> {
		const enrollments = await api.courses.getAllEnrollments(
			undefined,
			undefined,
			undefined,
			0,
			1000,
		);

		// Group by date for the last N days
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(endDate.getDate() - days);

		const dateMap = new Map<
			string,
			{ enrollments: number; completions: number }
		>();

		// Initialize all dates with 0
		for (
			let d = new Date(startDate);
			d <= endDate;
			d.setDate(d.getDate() + 1)
		) {
			const dateStr = d.toISOString().split("T")[0];
			dateMap.set(dateStr, { enrollments: 0, completions: 0 });
		}

		// Count enrollments and completions by date
		enrollments.forEach((enrollment: any) => {
			if (enrollment.enrolled_at) {
				const enrolledDate = new Date(enrollment.enrolled_at)
					.toISOString()
					.split("T")[0];
				if (dateMap.has(enrolledDate)) {
					const current = dateMap.get(enrolledDate) || {
						enrollments: 0,
						completions: 0,
					};
					dateMap.set(enrolledDate, {
						enrollments: current.enrollments + 1,
						completions: current.completions,
					});
				}
			}

			if (enrollment.completed_at) {
				const completedDate = new Date(enrollment.completed_at)
					.toISOString()
					.split("T")[0];
				if (dateMap.has(completedDate)) {
					const current = dateMap.get(completedDate) || {
						enrollments: 0,
						completions: 0,
					};
					dateMap.set(completedDate, {
						enrollments: current.enrollments,
						completions: current.completions + 1,
					});
				}
			}
		});

		// Convert to array format for chart
		return Array.from(dateMap.entries()).map(([date, data]) => ({
			date,
			enrollments: data.enrollments,
			completions: data.completions,
		}));
	},
};
