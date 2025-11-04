import { createFileRoute } from "@tanstack/react-router";
import { METADATA } from "../../constants/metadata";

export const Route = createFileRoute("/_dashboardLayout/activity")({
	head: () => ({
		meta: [
			{
				title: "Activity - OpenCircle Admin",
			},
			{
				name: "description",
				content: "View activity logs on OpenCircle",
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
	return <div>Activity</div>;
}
