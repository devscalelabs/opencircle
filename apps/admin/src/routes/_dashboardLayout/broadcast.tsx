import { createFileRoute } from "@tanstack/react-router";
import { METADATA } from "../../constants/metadata";

export const Route = createFileRoute("/_dashboardLayout/broadcast")({
	head: () => ({
		meta: [
			{
				title: "Broadcast - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Broadcast messages to users on OpenCircle",
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
	return <div>Broadcast</div>;
}
