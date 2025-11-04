import { createFileRoute } from "@tanstack/react-router";
import { METADATA } from "../../constants/metadata";

export const Route = createFileRoute("/_dashboardLayout/settings")({
	head: () => ({
		meta: [
			{
				title: "Settings - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Admin settings for OpenCircle",
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
	return <div>Settings</div>;
}
