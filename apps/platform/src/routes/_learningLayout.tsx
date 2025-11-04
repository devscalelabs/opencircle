import { createFileRoute, Outlet } from "@tanstack/react-router";
import { METADATA } from "../constants/metadata";

export const Route = createFileRoute("/_learningLayout")({
	head: () => ({
		meta: [
			{
				title: "Learning - OpenCircle",
			},
			{
				name: "description",
				content:
					"Explore and learn from the best courses and lessons on OpenCircle",
			},
			{
				property: "og:title",
				content: "Learning - OpenCircle",
			},
			{
				property: "og:description",
				content:
					"Explore and learn from the best courses and lessons on OpenCircle",
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
	return <Outlet />;
}
