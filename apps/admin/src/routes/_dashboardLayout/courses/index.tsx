import { Button } from "@opencircle/ui";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CourseTable } from "../../../features/course/components/courseTable";
import { useCourses } from "../../../features/course/hooks/useCourses";

export const Route = createFileRoute("/_dashboardLayout/courses/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { courses } = useCourses();
	return (
		<main>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="font-medium text-2xl">Courses</h1>
				<Link to="/courses/new">
					<Button size="sm">Create Course</Button>
				</Link>
			</div>
			<CourseTable courses={courses} />
		</main>
	);
}
