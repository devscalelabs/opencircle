import type { CourseCreate, CourseUpdate } from "@opencircle/core";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { METADATA } from "../../../constants/metadata";
import { useAccount } from "../../../features/auth/hooks/useAccount";
import { CourseEditor } from "../../../features/course/components/courseEditor";
import { useCourseSubmission } from "../../../features/course/hooks/useCourseSubmission";

type CourseFormData = Omit<CourseCreate, "instructor_id">;

export const Route = createFileRoute("/_dashboardLayout/courses/new")({
	head: () => ({
		meta: [
			{
				title: "Create Course - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Create a new course on OpenCircle",
			},
		],
		links: [
			{
				rel: "icon",
				href: METADATA.favicon,
			},
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const router = useRouter();
	const { createCourse, isSubmitting } = useCourseSubmission();
	const { account } = useAccount();

	const handleSave = async (data: CourseCreate | CourseUpdate) => {
		try {
			if (!account?.id) {
				throw new Error("User not authenticated");
			}

			// Cast to CourseCreate and add instructor_id for new course creation
			const courseData: CourseCreate = {
				...(data as CourseFormData),
				instructor_id: account.id,
			};

			await createCourse(courseData);
			// Redirect to courses list
			router.navigate({ to: "/courses" });
		} catch (error) {
			console.error("Failed to create course:", error);
		}
	};

	const handleCancel = () => {
		router.navigate({ to: "/courses" });
	};

	return (
		<CourseEditor
			onSave={handleSave}
			onCancel={handleCancel}
			loading={isSubmitting}
			isEdit={false}
		/>
	);
}
