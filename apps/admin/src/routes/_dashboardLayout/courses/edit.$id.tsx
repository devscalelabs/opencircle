import type { CourseCreate, CourseUpdate } from "@opencircle/core";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { METADATA } from "../../../constants/metadata";
import { CourseEditor } from "../../../features/course/components/courseEditor";
import { useCourse } from "../../../features/course/hooks/useCourse";
import { useCourseSubmission } from "../../../features/course/hooks/useCourseSubmission";

export const Route = createFileRoute("/_dashboardLayout/courses/edit/$id")({
	head: () => ({
		meta: [
			{
				title: "Edit Course - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Edit a course on OpenCircle",
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
	const { id } = Route.useParams();
	const router = useRouter();
	const { course, isCourseLoading } = useCourse(id);
	const { updateCourse, isSubmitting } = useCourseSubmission();

	const handleSave = async (data: CourseCreate | CourseUpdate) => {
		try {
			updateCourse({ id, data });
			// Redirect to courses list
			router.navigate({ to: "/courses" });
		} catch (error) {
			console.error("Failed to update course:", error);
		}
	};

	const handleCancel = () => {
		router.navigate({ to: "/courses" });
	};

	if (isCourseLoading || !course) {
		return <div>Loading...</div>;
	}

	return (
		<CourseEditor
			course={course}
			onSave={handleSave}
			onCancel={handleCancel}
			loading={isSubmitting}
			isEdit={true}
		/>
	);
}
