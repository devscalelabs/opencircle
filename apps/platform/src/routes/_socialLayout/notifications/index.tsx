import { createFileRoute } from "@tanstack/react-router";
import { Header } from "../../../components/header";
import { METADATA } from "../../../constants/metadata";
import { NotificationList } from "../../../features/notifications/components/NotificationList";

export const Route = createFileRoute("/_socialLayout/notifications/")({
	head: () => ({
		meta: [
			{
				title: "Notifications - OpenCircle",
			},
			{
				name: "description",
				content: "Check your notifications on OpenCircle",
			},
			{
				property: "og:title",
				content: "Notifications - OpenCircle",
			},
			{
				property: "og:description",
				content: "Check your notifications on OpenCircle",
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
	component: Notifications,
});

function Notifications() {
	return (
		<>
			<Header label="Notifications" />
			<main>
				<NotificationList />
			</main>
		</>
	);
}
