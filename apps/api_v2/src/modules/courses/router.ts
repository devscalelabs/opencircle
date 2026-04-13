import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "../../types";
import { authMiddleware, optionalAuthMiddleware } from "../../middleware/auth";
import {
	courseCreateSchema,
	courseUpdateSchema,
	listCoursesQuerySchema,
	sectionCreateSchema,
	sectionUpdateSchema,
	listSectionsQuerySchema,
	lessonCreateSchema,
	lessonUpdateSchema,
	listLessonsQuerySchema,
	enrollmentCreateSchema,
	enrollmentUpdateSchema,
	listEnrollmentsQuerySchema,
} from "./schema";
import {
	createCourse,
	getCourse,
	listCourses,
	getFeaturedCourses,
	updateCourse,
	deleteCourse,
	createSection,
	getSection,
	listSections,
	updateSection,
	deleteSection,
	createLesson,
	getLesson,
	listLessons,
	updateLesson,
	deleteLesson,
	createEnrollment,
	getEnrollment,
	listEnrollments,
	updateEnrollment,
	deleteEnrollment,
} from "./service";

export const coursesRouter = new Hono<Context>();

coursesRouter.post(
	"/courses",
	authMiddleware,
	zValidator("json", courseCreateSchema),
	async (c) => {
		const data = c.req.valid("json");
		const result = await createCourse(data);
		return c.json({ data: result }, 201);
	},
);

coursesRouter.get("/courses/featured", async (c) => {
	const result = await getFeaturedCourses();
	return c.json({ data: result });
});

coursesRouter.get(
	"/courses",
	optionalAuthMiddleware,
	zValidator("query", listCoursesQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const user = c.get("user");
		const result = await listCourses(query, user?.role);
		return c.json({ data: result });
	},
);

coursesRouter.get("/courses/:id", async (c) => {
	const id = c.req.param("id");
	const result = await getCourse(id);
	return c.json({ data: result });
});

coursesRouter.put(
	"/courses/:id",
	authMiddleware,
	zValidator("json", courseUpdateSchema),
	async (c) => {
		const id = c.req.param("id");
		const data = c.req.valid("json");
		const result = await updateCourse(id, data);
		return c.json({ data: result });
	},
);

coursesRouter.delete("/courses/:id", authMiddleware, async (c) => {
	const id = c.req.param("id");
	const result = await deleteCourse(id);
	return c.json({ data: result });
});

coursesRouter.post(
	"/sections",
	authMiddleware,
	zValidator("json", sectionCreateSchema),
	async (c) => {
		const data = c.req.valid("json");
		const result = await createSection(data);
		return c.json({ data: result }, 201);
	},
);

coursesRouter.get("/sections/:id", async (c) => {
	const id = c.req.param("id");
	const result = await getSection(id);
	return c.json({ data: result });
});

coursesRouter.get(
	"/sections",
	zValidator("query", listSectionsQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const result = await listSections(query);
		return c.json({ data: result });
	},
);

coursesRouter.put(
	"/sections/:id",
	authMiddleware,
	zValidator("json", sectionUpdateSchema),
	async (c) => {
		const id = c.req.param("id");
		const data = c.req.valid("json");
		const result = await updateSection(id, data);
		return c.json({ data: result });
	},
);

coursesRouter.delete("/sections/:id", authMiddleware, async (c) => {
	const id = c.req.param("id");
	const result = await deleteSection(id);
	return c.json({ data: result });
});

coursesRouter.post(
	"/lessons",
	authMiddleware,
	zValidator("json", lessonCreateSchema),
	async (c) => {
		const data = c.req.valid("json");
		const result = await createLesson(data);
		return c.json({ data: result }, 201);
	},
);

coursesRouter.get("/lessons/:id", async (c) => {
	const id = c.req.param("id");
	const result = await getLesson(id);
	return c.json({ data: result });
});

coursesRouter.get(
	"/lessons",
	zValidator("query", listLessonsQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const result = await listLessons(query);
		return c.json({ data: result });
	},
);

coursesRouter.put(
	"/lessons/:id",
	authMiddleware,
	zValidator("json", lessonUpdateSchema),
	async (c) => {
		const id = c.req.param("id");
		const data = c.req.valid("json");
		const result = await updateLesson(id, data);
		return c.json({ data: result });
	},
);

coursesRouter.delete("/lessons/:id", authMiddleware, async (c) => {
	const id = c.req.param("id");
	const result = await deleteLesson(id);
	return c.json({ data: result });
});

coursesRouter.post(
	"/enrollments",
	authMiddleware,
	zValidator("json", enrollmentCreateSchema),
	async (c) => {
		const data = c.req.valid("json");
		const result = await createEnrollment(data);
		return c.json({ data: result }, 201);
	},
);

coursesRouter.get("/enrollments/:id", async (c) => {
	const id = c.req.param("id");
	const result = await getEnrollment(id);
	return c.json({ data: result });
});

coursesRouter.get(
	"/enrollments",
	zValidator("query", listEnrollmentsQuerySchema),
	async (c) => {
		const query = c.req.valid("query");
		const result = await listEnrollments(query);
		return c.json({ data: result });
	},
);

coursesRouter.put(
	"/enrollments/:id",
	authMiddleware,
	zValidator("json", enrollmentUpdateSchema),
	async (c) => {
		const id = c.req.param("id");
		const data = c.req.valid("json");
		const result = await updateEnrollment(id, data);
		return c.json({ data: result });
	},
);

coursesRouter.delete("/enrollments/:id", authMiddleware, async (c) => {
	const id = c.req.param("id");
	const result = await deleteEnrollment(id);
	return c.json({ data: result });
});
