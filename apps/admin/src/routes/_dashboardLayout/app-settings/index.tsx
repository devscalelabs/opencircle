import { createFileRoute } from "@tanstack/react-router";
import { METADATA } from "../../../constants/metadata";
import { AppSettings } from "../../../features/appSettings/components/appSettings";

export const Route = createFileRoute("/_dashboardLayout/app-settings/")({
	head: () => ({
		meta: [
			{
				title: "App Settings - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Configure app settings for OpenCircle",
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
	return <AppSettings />;
}
