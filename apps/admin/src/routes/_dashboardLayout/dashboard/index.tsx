import { createFileRoute } from "@tanstack/react-router";
import { METADATA } from "../../../constants/metadata";

export const Route = createFileRoute("/_dashboardLayout/dashboard/")({
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
	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-medium text-2xl text-foreground">Dashboard</h1>
			</div>

			<p className="text-foreground-secondary">
				Welcome to the OpenCircle Admin Dashboard.
			</p>
		</div>
	);
}
