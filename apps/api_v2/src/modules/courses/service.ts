import { prisma } from "../../utils/prisma";
import { NotFoundError, ConflictError } from "../../exceptions";
import type {
	CourseCreateInput,
	CourseUpdateInput,
	ListCoursesQuery,
	SectionCreateInput,
	SectionUpdateInput,
	ListSectionsQuery,
	LessonCreateInput,
	LessonUpdateInput,
	ListLessonsQuery,
	EnrollmentCreateInput,
	EnrollmentUpdateInput,
	ListEnrollmentsQuery,
} from "./schema";

export async function createCourse(data: CourseCreateInput) {
	return prisma.course.create({
		data: {
			title: data.title,
			description: data.description,
			thumbnailUrl: data.thumbnailUrl,
			status: data.status,
			instructorId: data.instructorId,
			price: data.price,
			isFeatured: data.isFeatured,
		},
		include: {
			instructor: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
		},
	});
}

export async function getCourse(id: string) {
	const course = await prisma.course.findUnique({
		where: { id, deletedAt: null },
		include: {
			instructor: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
			sections: {
				where: { deletedAt: null },
				orderBy: { order: "asc" },
				include: {
					lessons: {
						where: { deletedAt: null },
						orderBy: { order: "asc" },
					},
				},
			},
			enrollments: {
				where: { deletedAt: null },
			},
		},
	});

	if (!course) {
		throw new NotFoundError("Course");
	}

	return course;
}

export async function listCourses(query: ListCoursesQuery, userRole?: string) {
	const { page, limit, instructorId, status } = query;
	const skip = (page - 1) * limit;

	const where = {
		deletedAt: null,
		...(instructorId && { instructorId }),
		...(status
			? { status }
			: userRole !== "admin" && { status: "published" as const }),
	};

	const [items, total] = await Promise.all([
		prisma.course.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
			include: {
				instructor: {
					select: { id: true, username: true, name: true, avatarUrl: true },
				},
			},
		}),
		prisma.course.count({ where }),
	]);

	return { items, total, page, limit };
}

export async function getFeaturedCourses() {
	const items = await prisma.course.findMany({
		where: {
			isFeatured: true,
			status: "published",
			deletedAt: null,
		},
		orderBy: { createdAt: "desc" },
		include: {
			instructor: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
		},
	});

	return { items };
}

export async function updateCourse(id: string, data: CourseUpdateInput) {
	const course = await prisma.course.findUnique({
		where: { id, deletedAt: null },
	});

	if (!course) {
		throw new NotFoundError("Course");
	}

	return prisma.course.update({
		where: { id },
		data,
		include: {
			instructor: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
		},
	});
}

export async function deleteCourse(id: string) {
	const course = await prisma.course.findUnique({
		where: { id, deletedAt: null },
	});

	if (!course) {
		throw new NotFoundError("Course");
	}

	await prisma.enrolledCourse.updateMany({
		where: { courseId: id, deletedAt: null },
		data: { deletedAt: new Date() },
	});

	const sections = await prisma.section.findMany({
		where: { courseId: id, deletedAt: null },
		select: { id: true },
	});

	for (const section of sections) {
		await prisma.lesson.updateMany({
			where: { sectionId: section.id, deletedAt: null },
			data: { deletedAt: new Date() },
		});
	}

	await prisma.section.updateMany({
		where: { courseId: id, deletedAt: null },
		data: { deletedAt: new Date() },
	});

	await prisma.course.update({
		where: { id },
		data: { deletedAt: new Date() },
	});

	return { id };
}

export async function createSection(data: SectionCreateInput) {
	const course = await prisma.course.findUnique({
		where: { id: data.courseId, deletedAt: null },
	});

	if (!course) {
		throw new NotFoundError("Course");
	}

	return prisma.section.create({
		data: {
			title: data.title,
			description: data.description,
			order: data.order,
			courseId: data.courseId,
		},
		include: {
			course: { select: { id: true, title: true } },
		},
	});
}

export async function getSection(id: string) {
	const section = await prisma.section.findUnique({
		where: { id, deletedAt: null },
		include: {
			lessons: {
				where: { deletedAt: null },
				orderBy: { order: "asc" },
			},
		},
	});

	if (!section) {
		throw new NotFoundError("Section");
	}

	return section;
}

export async function listSections(query: ListSectionsQuery) {
	const { page, limit, courseId } = query;
	const skip = (page - 1) * limit;

	const where = {
		deletedAt: null,
		...(courseId && { courseId }),
	};

	const [items, total] = await Promise.all([
		prisma.section.findMany({
			where,
			skip,
			take: limit,
			orderBy: { order: "asc" },
		}),
		prisma.section.count({ where }),
	]);

	return { items, total, page, limit };
}

export async function updateSection(id: string, data: SectionUpdateInput) {
	const section = await prisma.section.findUnique({
		where: { id, deletedAt: null },
	});

	if (!section) {
		throw new NotFoundError("Section");
	}

	return prisma.section.update({
		where: { id },
		data,
	});
}

export async function deleteSection(id: string) {
	const section = await prisma.section.findUnique({
		where: { id, deletedAt: null },
	});

	if (!section) {
		throw new NotFoundError("Section");
	}

	await prisma.lesson.updateMany({
		where: { sectionId: id, deletedAt: null },
		data: { deletedAt: new Date() },
	});

	await prisma.section.update({
		where: { id },
		data: { deletedAt: new Date() },
	});

	return { id };
}

export async function createLesson(data: LessonCreateInput) {
	const section = await prisma.section.findUnique({
		where: { id: data.sectionId, deletedAt: null },
	});

	if (!section) {
		throw new NotFoundError("Section");
	}

	return prisma.lesson.create({
		data: {
			title: data.title,
			content: data.content,
			videoUrl: data.videoUrl,
			order: data.order,
			type: data.type,
			sectionId: data.sectionId,
		},
		include: {
			section: {
				select: { id: true, title: true, courseId: true },
			},
		},
	});
}

export async function getLesson(id: string) {
	const lesson = await prisma.lesson.findUnique({
		where: { id, deletedAt: null },
		include: {
			section: {
				select: { id: true, title: true, courseId: true },
			},
		},
	});

	if (!lesson) {
		throw new NotFoundError("Lesson");
	}

	const course = lesson.section?.courseId
		? await prisma.course.findUnique({
				where: { id: lesson.section.courseId },
				select: { id: true, title: true },
			})
		: null;

	return { ...lesson, course };
}

export async function listLessons(query: ListLessonsQuery) {
	const { page, limit, sectionId, type } = query;
	const skip = (page - 1) * limit;

	const where = {
		deletedAt: null,
		...(sectionId && { sectionId }),
		...(type && { type }),
	};

	const [items, total] = await Promise.all([
		prisma.lesson.findMany({
			where,
			skip,
			take: limit,
			orderBy: { order: "asc" },
		}),
		prisma.lesson.count({ where }),
	]);

	return { items, total, page, limit };
}

export async function updateLesson(id: string, data: LessonUpdateInput) {
	const lesson = await prisma.lesson.findUnique({
		where: { id, deletedAt: null },
	});

	if (!lesson) {
		throw new NotFoundError("Lesson");
	}

	return prisma.lesson.update({
		where: { id },
		data,
	});
}

export async function deleteLesson(id: string) {
	const lesson = await prisma.lesson.findUnique({
		where: { id, deletedAt: null },
	});

	if (!lesson) {
		throw new NotFoundError("Lesson");
	}

	return prisma.lesson.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
}

export async function createEnrollment(data: EnrollmentCreateInput) {
	const course = await prisma.course.findUnique({
		where: { id: data.courseId, deletedAt: null },
	});

	if (!course) {
		throw new NotFoundError("Course");
	}

	const existing = await prisma.enrolledCourse.findUnique({
		where: {
			userId_courseId: {
				userId: data.userId,
				courseId: data.courseId,
			},
		},
	});

	if (existing && !existing.deletedAt) {
		throw new ConflictError("User is already enrolled in this course");
	}

	return prisma.enrolledCourse.create({
		data: {
			userId: data.userId,
			courseId: data.courseId,
			status: data.status,
			enrolledAt: new Date(),
		},
		include: {
			user: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
			course: {
				select: { id: true, title: true },
			},
		},
	});
}

export async function getEnrollment(id: string) {
	const enrollment = await prisma.enrolledCourse.findUnique({
		where: { id, deletedAt: null },
		include: {
			user: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
			course: {
				select: { id: true, title: true },
			},
		},
	});

	if (!enrollment) {
		throw new NotFoundError("Enrollment");
	}

	return enrollment;
}

export async function listEnrollments(query: ListEnrollmentsQuery) {
	const { page, limit, userId, courseId, status } = query;
	const skip = (page - 1) * limit;

	const where = {
		deletedAt: null,
		...(userId && { userId }),
		...(courseId && { courseId }),
		...(status && { status }),
	};

	const [items, total] = await Promise.all([
		prisma.enrolledCourse.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
			include: {
				user: {
					select: { id: true, username: true, name: true, avatarUrl: true },
				},
				course: {
					select: { id: true, title: true },
				},
			},
		}),
		prisma.enrolledCourse.count({ where }),
	]);

	return { items, total, page, limit };
}

export async function updateEnrollment(
	id: string,
	data: EnrollmentUpdateInput,
) {
	const enrollment = await prisma.enrolledCourse.findUnique({
		where: { id, deletedAt: null },
	});

	if (!enrollment) {
		throw new NotFoundError("Enrollment");
	}

	const updateData: Record<string, unknown> = { ...data };
	if (data.status === "completed") {
		updateData.completedAt = new Date();
	}

	return prisma.enrolledCourse.update({
		where: { id },
		data: updateData,
		include: {
			user: {
				select: { id: true, username: true, name: true, avatarUrl: true },
			},
			course: {
				select: { id: true, title: true },
			},
		},
	});
}

export async function deleteEnrollment(id: string) {
	const enrollment = await prisma.enrolledCourse.findUnique({
		where: { id, deletedAt: null },
	});

	if (!enrollment) {
		throw new NotFoundError("Enrollment");
	}

	return prisma.enrolledCourse.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
}
