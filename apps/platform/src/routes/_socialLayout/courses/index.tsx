import { createFileRoute } from "@tanstack/react-router";
import { Header } from "../../../components/header";
import { METADATA } from "../../../constants/metadata";
import { CourseList } from "../../../features/courses/components/courseList";

export const Route = createFileRoute("/_socialLayout/courses/")({
	head: () => ({
		meta: [
			{
				title: "Courses - OpenCircle",
			},
			{
				name: "description",
				content: "Explore and enroll in amazing courses on OpenCircle",
			},
			{
				property: "og:title",
				content: "Courses - OpenCircle",
			},
			{
				property: "og:description",
				content: "Explore and enroll in amazing courses on OpenCircle",
			},
			{
				property: "og:image",
				content: METADATA.ogImage,
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
	return (
		<>
			<Header label="Courses" />
			<CourseList />
		</>
	);
}
