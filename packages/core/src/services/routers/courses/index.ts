import { BaseRouter } from "../../../utils/baseRouter";
import type {
	Course,
	CourseCreate,
	CourseEnrollmentDistribution,
	CourseUpdate,
	DashboardStats,
	EnrolledCourse,
	EnrolledCourseCreate,
	EnrolledCourseUpdate,
	EnrollmentChartData,
	Lesson,
	LessonCreate,
	LessonUpdate,
	Section,
	SectionCreate,
	SectionUpdate,
	UserGrowthData,
} from "../../types";

export class CoursesRouter extends BaseRouter {
	// Course operations
	async getAllCourses(
		skip: number = 0,
		limit: number = 100,
		instructorId?: string,
		status?: string,
	): Promise<Course[]> {
		const params = new URLSearchParams({
			skip: skip.toString(),
			limit: limit.toString(),
		});
		if (instructorId) params.append("instructor_id", instructorId);
		if (status) params.append("status", status);
		return this.client.get<Course[]>(`courses/?${params.toString()}`);
	}

	async getFeaturedCourses(
		skip: number = 0,
		limit: number = 100,
	): Promise<Course[]> {
		const params = new URLSearchParams({
			skip: skip.toString(),
			limit: limit.toString(),
		});
		return this.client.get<Course[]>(`courses/featured/?${params.toString()}`);
	}

	async getCourseById(courseId: string): Promise<Course> {
		return this.client.get<Course>(`courses/${courseId}`);
	}

	async createCourse(data: CourseCreate): Promise<Course> {
		return this.client.post<Course>("courses/", data);
	}

	async updateCourse(courseId: string, data: CourseUpdate): Promise<Course> {
		return this.client.put<Course>(`courses/${courseId}`, data);
	}

	async deleteCourse(courseId: string): Promise<{ message: string }> {
		return this.client.delete<{ message: string }>(`courses/${courseId}`);
	}

	// Section operations
	async getAllSections(
		courseId?: string,
		skip: number = 0,
		limit: number = 100,
	): Promise<Section[]> {
		const params = new URLSearchParams({
			skip: skip.toString(),
			limit: limit.toString(),
		});
		if (courseId) params.append("course_id", courseId);
		return this.client.get<Section[]>(`sections/?${params.toString()}`);
	}

	async getSectionById(sectionId: string): Promise<Section> {
		return this.client.get<Section>(`sections/${sectionId}`);
	}

	async createSection(data: SectionCreate): Promise<Section> {
		return this.client.post<Section>("sections/", data);
	}

	async updateSection(
		sectionId: string,
		data: SectionUpdate,
	): Promise<Section> {
		return this.client.put<Section>(`sections/${sectionId}`, data);
	}

	async deleteSection(sectionId: string): Promise<{ message: string }> {
		return this.client.delete<{ message: string }>(`sections/${sectionId}`);
	}

	// Lesson operations
	async getAllLessons(
		sectionId?: string,
		skip: number = 0,
		limit: number = 100,
		type?: string,
	): Promise<Lesson[]> {
		const params = new URLSearchParams({
			skip: skip.toString(),
			limit: limit.toString(),
		});
		if (sectionId) params.append("section_id", sectionId);
		if (type) params.append("type", type);
		return this.client.get<Lesson[]>(`lessons/?${params.toString()}`);
	}

	async getLessonById(lessonId: string): Promise<Lesson> {
		return this.client.get<Lesson>(`lessons/${lessonId}`);
	}

	async createLesson(data: LessonCreate): Promise<Lesson> {
		return this.client.post<Lesson>("lessons/", data);
	}

	async updateLesson(lessonId: string, data: LessonUpdate): Promise<Lesson> {
		return this.client.put<Lesson>(`lessons/${lessonId}`, data);
	}

	async deleteLesson(lessonId: string): Promise<{ message: string }> {
		return this.client.delete<{ message: string }>(`lessons/${lessonId}`);
	}

	// Enrollment operations
	async getAllEnrollments(
		userId?: string,
		courseId?: string,
		status?: string,
		skip: number = 0,
		limit: number = 100,
	): Promise<EnrolledCourse[]> {
		const params = new URLSearchParams({
			skip: skip.toString(),
			limit: limit.toString(),
		});
		if (userId) params.append("user_id", userId);
		if (courseId) params.append("course_id", courseId);
		if (status) params.append("status", status);
		return this.client.get<EnrolledCourse[]>(
			`enrollments/?${params.toString()}`,
		);
	}

	async getEnrollmentById(enrollmentId: string): Promise<EnrolledCourse> {
		return this.client.get<EnrolledCourse>(`enrollments/${enrollmentId}`);
	}

	async createEnrollment(data: EnrolledCourseCreate): Promise<EnrolledCourse> {
		return this.client.post<EnrolledCourse>("enrollments/", data);
	}

	async updateEnrollment(
		enrollmentId: string,
		data: EnrolledCourseUpdate,
	): Promise<EnrolledCourse> {
		return this.client.put<EnrolledCourse>(`enrollments/${enrollmentId}`, data);
	}

	async deleteEnrollment(enrollmentId: string): Promise<{ message: string }> {
		return this.client.delete<{ message: string }>(
			`enrollments/${enrollmentId}`,
		);
	}

	// Convenience methods
	async getCourseSections(courseId: string): Promise<Section[]> {
		return this.getAllSections(courseId);
	}

	async getSectionLessons(sectionId: string): Promise<Lesson[]> {
		return this.getAllLessons(sectionId);
	}

	async getUserEnrollments(userId: string): Promise<EnrolledCourse[]> {
		return this.getAllEnrollments(userId);
	}

	async getCourseEnrollments(courseId: string): Promise<EnrolledCourse[]> {
		return this.getAllEnrollments(undefined, courseId);
	}

	async enrollUser(userId: string, courseId: string): Promise<EnrolledCourse> {
		return this.createEnrollment({
			user_id: userId,
			course_id: courseId,
			status: "active" as any,
		});
	}

	// Dashboard methods
	async getDashboardStats(): Promise<DashboardStats> {
		// Get all users, courses, and enrollments
		const [users, courses, enrollments] = await Promise.all([
			this.client.get<any[]>("users/?limit=10000"),
			this.getAllCourses(0, 10000),
			this.getAllEnrollments(undefined, undefined, undefined, 0, 10000),
		]);

		const totalUsers = users.length;
		const totalCourses = courses.length;
		const activeEnrollments = enrollments.filter(
			(e) => e.status === "active",
		).length;
		const completedEnrollments = enrollments.filter(
			(e) => e.status === "completed",
		).length;
		const totalEnrollments = enrollments.length;

		return {
			totalUsers,
			totalCourses,
			activeEnrollments,
			completedEnrollments,
			totalEnrollments,
		};
	}

	async getEnrollmentChartData(days = 30): Promise<EnrollmentChartData[]> {
		// Get enrollments with course data
		const enrollments = await this.getAllEnrollments(
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

		// Create a map to count enrollments by date
		const dateMap = new Map<string, number>();

		// Initialize all dates with 0
		for (
			let d = new Date(startDate);
			d <= endDate;
			d.setDate(d.getDate() + 1)
		) {
			const dateStr = d.toISOString().split("T")[0];
			dateMap.set(dateStr, 0);
		}

		// Count enrollments by date (total, regardless of course)
		enrollments.forEach((enrollment) => {
			// Use enrolled_at if available, otherwise fall back to created_at
			const enrollmentDate = enrollment.enrolled_at || enrollment.created_at;
			if (enrollmentDate) {
				const enrolledDate = new Date(enrollmentDate)
					.toISOString()
					.split("T")[0];
				const currentCount = dateMap.get(enrolledDate) || 0;
				dateMap.set(enrolledDate, currentCount + 1);
			}
		});

		// Convert to array format for chart, sorted by date
		return Array.from(dateMap.entries())
			.map(([date, total]) => ({ date, total }))
			.sort(
				(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
			) as EnrollmentChartData[];
	}

	async getCourseEnrollmentDistribution(
		limit = 5,
	): Promise<CourseEnrollmentDistribution[]> {
		const [courses, enrollments] = await Promise.all([
			this.getAllCourses(0, 1000),
			this.getAllEnrollments(undefined, undefined, undefined, 0, 10000),
		]);

		const courseEnrollmentMap = new Map<
			string,
			{ title: string; count: number }
		>();
		courses.forEach((course) => {
			courseEnrollmentMap.set(course.id, { title: course.title, count: 0 });
		});

		enrollments.forEach((enrollment) => {
			const courseData = courseEnrollmentMap.get(enrollment.course_id);
			if (courseData) {
				courseData.count += 1;
			}
		});

		return Array.from(courseEnrollmentMap.entries())
			.map(([courseId, data]) => ({
				courseId,
				courseTitle: data.title,
				enrollmentCount: data.count,
			}))
			.sort((a, b) => b.enrollmentCount - a.enrollmentCount)
			.slice(0, limit);
	}

	async getUserGrowthData(days = 30): Promise<UserGrowthData[]> {
		const users =
			await this.client.get<{ id: string; created_at: string }[]>(
				"users/?limit=10000",
			);

		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(endDate.getDate() - days);

		const dateMap = new Map<string, number>();
		for (
			let d = new Date(startDate);
			d <= endDate;
			d.setDate(d.getDate() + 1)
		) {
			const dateStr = d.toISOString().split("T")[0];
			dateMap.set(dateStr, 0);
		}

		users.forEach((user) => {
			if (user.created_at) {
				const createdDate = new Date(user.created_at)
					.toISOString()
					.split("T")[0];
				if (dateMap.has(createdDate)) {
					const currentCount = dateMap.get(createdDate) || 0;
					dateMap.set(createdDate, currentCount + 1);
				}
			}
		});

		let cumulative = users.filter((u) => {
			const createdDate = new Date(u.created_at);
			return createdDate < startDate;
		}).length;

		return Array.from(dateMap.entries())
			.sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
			.map(([date, newUsers]) => {
				cumulative += newUsers;
				return {
					date,
					newUsers,
					cumulativeUsers: cumulative,
				};
			});
	}
}

export type {
	CourseEnrollmentDistribution,
	DashboardStats,
	EnrollmentChartData,
	UserGrowthData,
} from "./types";
