import { createFileRoute } from "@tanstack/react-router";
import { METADATA } from "../../constants/metadata";

export const Route = createFileRoute("/_socialLayout/about")({
	head: () => ({
		meta: [
			{
				title: "About - OpenCircle",
			},
			{
				name: "description",
				content: "Learn more about OpenCircle, the platform for creators",
			},
			{
				property: "og:title",
				content: "About - OpenCircle",
			},
			{
				property: "og:description",
				content: "Learn more about OpenCircle, the platform for creators",
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
	component: About,
});

function About() {
	return <div className="p-2">Hello from About!</div>;
}
