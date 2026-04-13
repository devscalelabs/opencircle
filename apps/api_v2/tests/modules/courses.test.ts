import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { app } from "../../src/app";
import { prisma } from "../../src/utils/prisma";
import {
	createTestUser,
	createTestAdmin,
	getAuthHeaders,
	jsonHeaders,
	cleanupAll,
	seedAppSettings,
} from "../helpers";

describe("Courses", () => {
	beforeEach(async () => {
		await cleanupAll();
		await seedAppSettings();
	});

	afterAll(async () => {
		await cleanupAll();
	});

	describe("Courses CRUD", () => {
		it("should create a course", async () => {
			const user = await createTestUser();
			const res = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Test Course",
					description: "A test course",
					instructorId: user.id,
					status: "draft",
				}),
			});
			expect(res.status).toBe(201);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(data.data.title).toBe("Test Course");
			expect(data.data.instructorId).toBe(user.id);
		});

		it("should get a course by id", async () => {
			const user = await createTestUser();
			const createRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Get Course",
					instructorId: user.id,
				}),
			});
			const { data: course } = await createRes.json();

			const res = await app.request(`/api/courses/${course.id}`);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.id).toBe(course.id);
			expect(data.data.title).toBe("Get Course");
		});

		it("should return 404 for non-existent course", async () => {
			const res = await app.request(
				"/api/courses/00000000-0000-0000-0000-000000000000",
			);
			expect(res.status).toBe(404);
		});

		it("should list courses", async () => {
			const user = await createTestUser();
			await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Listed Course",
					instructorId: user.id,
					status: "published",
				}),
			});

			const res = await app.request("/api/courses");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.items.length).toBeGreaterThanOrEqual(1);
		});

		it("should filter courses by status for non-admin", async () => {
			const user = await createTestUser();
			await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Draft Course",
					instructorId: user.id,
					status: "draft",
				}),
			});
			await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Published Course",
					instructorId: user.id,
					status: "published",
				}),
			});

			const res = await app.request("/api/courses");
			const data = await res.json();
			const titles = data.data.items.map((c: { title: string }) => c.title);
			expect(titles).not.toContain("Draft Course");
			expect(titles).toContain("Published Course");
		});

		it("should list all courses for admin regardless of status", async () => {
			const admin = await createTestAdmin();
			await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(admin) },
				body: JSON.stringify({
					title: "Admin Draft Course",
					instructorId: admin.id,
					status: "draft",
				}),
			});

			const res = await app.request("/api/courses", {
				headers: getAuthHeaders(admin),
			});
			const data = await res.json();
			const titles = data.data.items.map((c: { title: string }) => c.title);
			expect(titles).toContain("Admin Draft Course");
		});

		it("should get featured courses", async () => {
			const user = await createTestUser();
			await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Featured Course",
					instructorId: user.id,
					status: "published",
					isFeatured: true,
				}),
			});
			await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Non-Featured Course",
					instructorId: user.id,
					status: "published",
					isFeatured: false,
				}),
			});

			const res = await app.request("/api/courses/featured");
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.items.length).toBe(1);
			expect(data.data.items[0].isFeatured).toBe(true);
		});

		it("should update a course", async () => {
			const user = await createTestUser();
			const createRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Original Course",
					instructorId: user.id,
				}),
			});
			const { data: course } = await createRes.json();

			const res = await app.request(`/api/courses/${course.id}`, {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Updated Course",
					status: "published",
				}),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.title).toBe("Updated Course");
			expect(data.data.status).toBe("published");
		});

		it("should delete a course (soft delete)", async () => {
			const user = await createTestUser();
			const createRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "To Delete",
					instructorId: user.id,
				}),
			});
			const { data: course } = await createRes.json();

			const res = await app.request(`/api/courses/${course.id}`, {
				method: "DELETE",
				headers: getAuthHeaders(user),
			});
			expect(res.status).toBe(200);

			const getRes = await app.request(`/api/courses/${course.id}`);
			expect(getRes.status).toBe(404);
		});
	});

	describe("Sections CRUD", () => {
		it("should create a section", async () => {
			const user = await createTestUser();
			const courseRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Section Course",
					instructorId: user.id,
				}),
			});
			const { data: course } = await courseRes.json();

			const res = await app.request("/api/sections", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Section One",
					order: 1,
					courseId: course.id,
				}),
			});
			expect(res.status).toBe(201);
			const data = await res.json();
			expect(data.data.title).toBe("Section One");
			expect(data.data.courseId).toBe(course.id);
		});

		it("should get a section by id", async () => {
			const user = await createTestUser();
			const courseRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Get Section Course",
					instructorId: user.id,
				}),
			});
			const { data: course } = await courseRes.json();
			const sectionRes = await app.request("/api/sections", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Get Section",
					order: 1,
					courseId: course.id,
				}),
			});
			const { data: section } = await sectionRes.json();

			const res = await app.request(`/api/sections/${section.id}`);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.id).toBe(section.id);
		});

		it("should list sections with courseId filter", async () => {
			const user = await createTestUser();
			const courseRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "List Section Course",
					instructorId: user.id,
				}),
			});
			const { data: course } = await courseRes.json();
			await app.request("/api/sections", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Section Alpha",
					order: 1,
					courseId: course.id,
				}),
			});
			await app.request("/api/sections", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Section Beta",
					order: 2,
					courseId: course.id,
				}),
			});

			const res = await app.request(`/api/sections?courseId=${course.id}`);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.items.length).toBe(2);
		});

		it("should update a section", async () => {
			const user = await createTestUser();
			const courseRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Update Section Course",
					instructorId: user.id,
				}),
			});
			const { data: course } = await courseRes.json();
			const sectionRes = await app.request("/api/sections", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Original Section",
					order: 1,
					courseId: course.id,
				}),
			});
			const { data: section } = await sectionRes.json();

			const res = await app.request(`/api/sections/${section.id}`, {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ title: "Updated Section" }),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.title).toBe("Updated Section");
		});

		it("should delete a section", async () => {
			const user = await createTestUser();
			const courseRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Delete Section Course",
					instructorId: user.id,
				}),
			});
			const { data: course } = await courseRes.json();
			const sectionRes = await app.request("/api/sections", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "To Delete Section",
					order: 1,
					courseId: course.id,
				}),
			});
			const { data: section } = await sectionRes.json();

			const res = await app.request(`/api/sections/${section.id}`, {
				method: "DELETE",
				headers: getAuthHeaders(user),
			});
			expect(res.status).toBe(200);

			const getRes = await app.request(`/api/sections/${section.id}`);
			expect(getRes.status).toBe(404);
		});
	});

	describe("Lessons CRUD", () => {
		it("should create a lesson", async () => {
			const user = await createTestUser();
			const courseRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Lesson Course",
					instructorId: user.id,
				}),
			});
			const { data: course } = await courseRes.json();
			const sectionRes = await app.request("/api/sections", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Lesson Section",
					order: 1,
					courseId: course.id,
				}),
			});
			const { data: section } = await sectionRes.json();

			const res = await app.request("/api/lessons", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "First Lesson",
					content: "Lesson content",
					order: 1,
					sectionId: section.id,
					type: "text",
				}),
			});
			expect(res.status).toBe(201);
			const data = await res.json();
			expect(data.data.title).toBe("First Lesson");
			expect(data.data.type).toBe("text");
		});

		it("should get a lesson by id", async () => {
			const user = await createTestUser();
			const courseRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Get Lesson Course",
					instructorId: user.id,
				}),
			});
			const { data: course } = await courseRes.json();
			const sectionRes = await app.request("/api/sections", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Get Lesson Section",
					order: 1,
					courseId: course.id,
				}),
			});
			const { data: section } = await sectionRes.json();
			const lessonRes = await app.request("/api/lessons", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Get Lesson",
					order: 1,
					sectionId: section.id,
				}),
			});
			const { data: lesson } = await lessonRes.json();

			const res = await app.request(`/api/lessons/${lesson.id}`);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.id).toBe(lesson.id);
		});

		it("should list lessons filtered by sectionId", async () => {
			const user = await createTestUser();
			const courseRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "List Lesson Course",
					instructorId: user.id,
				}),
			});
			const { data: course } = await courseRes.json();
			const sectionRes = await app.request("/api/sections", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "List Lesson Section",
					order: 1,
					courseId: course.id,
				}),
			});
			const { data: section } = await sectionRes.json();

			await app.request("/api/lessons", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Lesson 1",
					order: 1,
					sectionId: section.id,
				}),
			});
			await app.request("/api/lessons", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Lesson 2",
					order: 2,
					sectionId: section.id,
				}),
			});

			const res = await app.request(`/api/lessons?sectionId=${section.id}`);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.items.length).toBe(2);
		});

		it("should update a lesson", async () => {
			const user = await createTestUser();
			const courseRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Update Lesson Course",
					instructorId: user.id,
				}),
			});
			const { data: course } = await courseRes.json();
			const sectionRes = await app.request("/api/sections", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Update Lesson Section",
					order: 1,
					courseId: course.id,
				}),
			});
			const { data: section } = await sectionRes.json();
			const lessonRes = await app.request("/api/lessons", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Original Lesson",
					order: 1,
					sectionId: section.id,
				}),
			});
			const { data: lesson } = await lessonRes.json();

			const res = await app.request(`/api/lessons/${lesson.id}`, {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Updated Lesson",
					content: "New content",
				}),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.title).toBe("Updated Lesson");
			expect(data.data.content).toBe("New content");
		});

		it("should delete a lesson", async () => {
			const user = await createTestUser();
			const courseRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Delete Lesson Course",
					instructorId: user.id,
				}),
			});
			const { data: course } = await courseRes.json();
			const sectionRes = await app.request("/api/sections", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "Delete Lesson Section",
					order: 1,
					courseId: course.id,
				}),
			});
			const { data: section } = await sectionRes.json();
			const lessonRes = await app.request("/api/lessons", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					title: "To Delete Lesson",
					order: 1,
					sectionId: section.id,
				}),
			});
			const { data: lesson } = await lessonRes.json();

			const res = await app.request(`/api/lessons/${lesson.id}`, {
				method: "DELETE",
				headers: getAuthHeaders(user),
			});
			expect(res.status).toBe(200);

			const getRes = await app.request(`/api/lessons/${lesson.id}`);
			expect(getRes.status).toBe(404);
		});
	});

	describe("Enrollments CRUD", () => {
		it("should create an enrollment", async () => {
			const user = await createTestUser();
			const instructor = await createTestUser();
			const courseRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(instructor) },
				body: JSON.stringify({
					title: "Enrollment Course",
					instructorId: instructor.id,
					status: "published",
				}),
			});
			const { data: course } = await courseRes.json();

			const res = await app.request("/api/enrollments", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					userId: user.id,
					courseId: course.id,
				}),
			});
			expect(res.status).toBe(201);
			const data = await res.json();
			expect(data.data).toBeDefined();
			expect(data.data.userId).toBe(user.id);
			expect(data.data.courseId).toBe(course.id);
			expect(data.data.status).toBe("active");
		});

		it("should reject duplicate enrollment", async () => {
			const user = await createTestUser();
			const instructor = await createTestUser();
			const courseRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(instructor) },
				body: JSON.stringify({
					title: "Dup Enroll Course",
					instructorId: instructor.id,
					status: "published",
				}),
			});
			const { data: course } = await courseRes.json();

			await app.request("/api/enrollments", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					userId: user.id,
					courseId: course.id,
				}),
			});

			const res = await app.request("/api/enrollments", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					userId: user.id,
					courseId: course.id,
				}),
			});
			expect(res.status).toBe(409);
		});

		it("should get an enrollment by id", async () => {
			const user = await createTestUser();
			const instructor = await createTestUser();
			const courseRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(instructor) },
				body: JSON.stringify({
					title: "Get Enroll Course",
					instructorId: instructor.id,
				}),
			});
			const { data: course } = await courseRes.json();
			const enrollRes = await app.request("/api/enrollments", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					userId: user.id,
					courseId: course.id,
				}),
			});
			const { data: enrollment } = await enrollRes.json();

			const res = await app.request(`/api/enrollments/${enrollment.id}`);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.id).toBe(enrollment.id);
		});

		it("should list enrollments by courseId", async () => {
			const user = await createTestUser();
			const instructor = await createTestUser();
			const courseRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(instructor) },
				body: JSON.stringify({
					title: "List Enroll Course",
					instructorId: instructor.id,
				}),
			});
			const { data: course } = await courseRes.json();
			await app.request("/api/enrollments", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					userId: user.id,
					courseId: course.id,
				}),
			});

			const res = await app.request(`/api/enrollments?courseId=${course.id}`);
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.items.length).toBe(1);
		});

		it("should update an enrollment status", async () => {
			const user = await createTestUser();
			const instructor = await createTestUser();
			const courseRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(instructor) },
				body: JSON.stringify({
					title: "Update Enroll Course",
					instructorId: instructor.id,
				}),
			});
			const { data: course } = await courseRes.json();
			const enrollRes = await app.request("/api/enrollments", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					userId: user.id,
					courseId: course.id,
				}),
			});
			const { data: enrollment } = await enrollRes.json();

			const res = await app.request(`/api/enrollments/${enrollment.id}`, {
				method: "PUT",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({ status: "completed" }),
			});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data.status).toBe("completed");
			expect(data.data.completedAt).not.toBeNull();
		});

		it("should delete an enrollment (soft delete)", async () => {
			const user = await createTestUser();
			const instructor = await createTestUser();
			const courseRes = await app.request("/api/courses", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(instructor) },
				body: JSON.stringify({
					title: "Delete Enroll Course",
					instructorId: instructor.id,
				}),
			});
			const { data: course } = await courseRes.json();
			const enrollRes = await app.request("/api/enrollments", {
				method: "POST",
				headers: { ...jsonHeaders(), ...getAuthHeaders(user) },
				body: JSON.stringify({
					userId: user.id,
					courseId: course.id,
				}),
			});
			const { data: enrollment } = await enrollRes.json();

			const res = await app.request(`/api/enrollments/${enrollment.id}`, {
				method: "DELETE",
				headers: getAuthHeaders(user),
			});
			expect(res.status).toBe(200);

			const getRes = await app.request(`/api/enrollments/${enrollment.id}`);
			expect(getRes.status).toBe(404);
		});
	});
});
