import { z } from "zod";

export const courseStatusEnum = z.enum(["draft", "published", "archived"]);
export const lessonTypeEnum = z.enum(["video", "text", "quiz", "assignment"]);
export const enrollmentStatusEnum = z.enum(["active", "completed", "dropped"]);

export const courseCreateSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	thumbnailUrl: z.string().url().optional(),
	status: courseStatusEnum.default("draft"),
	instructorId: z.string().uuid(),
	price: z.number().nonnegative().optional(),
	isFeatured: z.boolean().default(false),
});

export const courseUpdateSchema = z.object({
	title: z.string().min(1).optional(),
	description: z.string().optional(),
	thumbnailUrl: z.string().url().optional(),
	status: courseStatusEnum.optional(),
	instructorId: z.string().uuid().optional(),
	price: z.number().nonnegative().optional(),
	isFeatured: z.boolean().optional(),
});

export const listCoursesQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	instructorId: z.string().uuid().optional(),
	status: courseStatusEnum.optional(),
});

export const sectionCreateSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	order: z.number().int(),
	courseId: z.string().uuid(),
});

export const sectionUpdateSchema = z.object({
	title: z.string().min(1).optional(),
	description: z.string().optional(),
	order: z.number().int().optional(),
	courseId: z.string().uuid().optional(),
});

export const listSectionsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	courseId: z.string().uuid().optional(),
});

export const lessonCreateSchema = z.object({
	title: z.string().min(1),
	content: z.string().optional(),
	videoUrl: z.string().url().optional(),
	order: z.number().int(),
	type: lessonTypeEnum.default("text"),
	sectionId: z.string().uuid(),
});

export const lessonUpdateSchema = z.object({
	title: z.string().min(1).optional(),
	content: z.string().optional(),
	videoUrl: z.string().url().optional(),
	order: z.number().int().optional(),
	type: lessonTypeEnum.optional(),
	sectionId: z.string().uuid().optional(),
});

export const listLessonsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	sectionId: z.string().uuid().optional(),
	type: lessonTypeEnum.optional(),
});

export const enrollmentCreateSchema = z.object({
	userId: z.string().uuid(),
	courseId: z.string().uuid(),
	status: enrollmentStatusEnum.default("active"),
});

export const enrollmentUpdateSchema = z.object({
	status: enrollmentStatusEnum.optional(),
});

export const listEnrollmentsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	userId: z.string().uuid().optional(),
	courseId: z.string().uuid().optional(),
	status: enrollmentStatusEnum.optional(),
});

export type CourseCreateInput = z.infer<typeof courseCreateSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
export type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>;
export type SectionCreateInput = z.infer<typeof sectionCreateSchema>;
export type SectionUpdateInput = z.infer<typeof sectionUpdateSchema>;
export type ListSectionsQuery = z.infer<typeof listSectionsQuerySchema>;
export type LessonCreateInput = z.infer<typeof lessonCreateSchema>;
export type LessonUpdateInput = z.infer<typeof lessonUpdateSchema>;
export type ListLessonsQuery = z.infer<typeof listLessonsQuerySchema>;
export type EnrollmentCreateInput = z.infer<typeof enrollmentCreateSchema>;
export type EnrollmentUpdateInput = z.infer<typeof enrollmentUpdateSchema>;
export type ListEnrollmentsQuery = z.infer<typeof listEnrollmentsQuerySchema>;
