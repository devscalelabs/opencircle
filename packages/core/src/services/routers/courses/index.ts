import { BaseRouter } from "../../../utils/baseRouter";
import type {
	Course,
	CourseCreate,
	CourseUpdate,
	EnrolledCourse,
	EnrolledCourseCreate,
	EnrolledCourseUpdate,
	Lesson,
	LessonCreate,
	LessonUpdate,
	Section,
	SectionCreate,
	SectionUpdate,
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
}
