import { createFileRoute } from "@tanstack/react-router";
import { METADATA } from "../../constants/metadata";

export const Route = createFileRoute("/_dashboardLayout/dashboard")({
	head: () => ({
		meta: [
			{
				title: "Dashboard - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Admin Dashboard Overview",
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
	return <div>Hello "/"!</div>;
}
