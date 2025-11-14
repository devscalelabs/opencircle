import type { User } from "../auth/types";

export const CourseStatus = {
	DRAFT: "draft",
	PUBLISHED: "published",
	ARCHIVED: "archived",
} as const;

export type CourseStatus = (typeof CourseStatus)[keyof typeof CourseStatus];

export const LessonType = {
	VIDEO: "video",
	TEXT: "text",
	QUIZ: "quiz",
	ASSIGNMENT: "assignment",
} as const;

export type LessonType = (typeof LessonType)[keyof typeof LessonType];

export const EnrollmentStatus = {
	ACTIVE: "active",
	COMPLETED: "completed",
	DROPPED: "dropped",
} as const;

export type EnrollmentStatus =
	(typeof EnrollmentStatus)[keyof typeof EnrollmentStatus];

export interface Course {
	id: string;
	title: string;
	description?: string;
	thumbnail_url?: string;
	status: CourseStatus;
	instructor_id: string;
	price?: number;
	is_featured: boolean;
	instructor: User;
	sections: Section[];
	enrollments: EnrolledCourse[];
	created_at: string;
	updated_at: string;
}

export interface CourseCreate {
	title: string;
	description?: string;
	thumbnail_url?: string;
	status?: CourseStatus;
	instructor_id: string;
	price?: number;
	is_featured?: boolean;
}

export interface CourseUpdate {
	title?: string;
	description?: string;
	thumbnail_url?: string;
	status?: CourseStatus;
	instructor_id?: string;
	price?: number;
	is_featured?: boolean;
}

export interface Section {
	id: string;
	title: string;
	description?: string;
	order: number;
	course_id: string;
	course: Course;
	lessons: Lesson[];
	created_at: string;
	updated_at: string;
}

export interface SectionCreate {
	title: string;
	description?: string;
	order: number;
	course_id: string;
}

export interface SectionUpdate {
	title?: string;
	description?: string;
	order?: number;
	course_id?: string;
}

export interface Lesson {
	id: string;
	title: string;
	content?: string;
	video_url?: string;
	order: number;
	type: LessonType;
	section_id: string;
	section: Section;
	created_at: string;
	updated_at: string;
}

export interface LessonCreate {
	title: string;
	content?: string;
	video_url?: string;
	order: number;
	type?: LessonType;
	section_id: string;
}

export interface LessonUpdate {
	title?: string;
	content?: string;
	video_url?: string;
	order?: number;
	type?: LessonType;
	section_id?: string;
}

export interface EnrolledCourse {
	id: string;
	user_id: string;
	course_id: string;
	status: EnrollmentStatus;
	enrolled_at?: string;
	completed_at?: string;
	user: User;
	course: Course;
	created_at: string;
	updated_at: string;
}

export interface EnrolledCourseCreate {
	user_id: string;
	course_id: string;
	status?: EnrollmentStatus;
	enrolled_at?: string;
	completed_at?: string;
}

export interface EnrolledCourseUpdate {
	user_id?: string;
	course_id?: string;
	status?: EnrollmentStatus;
	enrolled_at?: string;
	completed_at?: string;
}
