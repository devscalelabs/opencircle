import { createFileRoute } from "@tanstack/react-router";
import { Header } from "../../../components/header";
import { useNotifications } from "../../../features/notifications/hooks/useNotifications";

export const Route = createFileRoute("/_socialLayout/notifications/$id")({
	component: NotificationDetail,
});

function NotificationDetail() {
	const { id } = Route.useParams();
	const { notifications } = useNotifications(0, 100);

	const notification = notifications.find((n: { id: string }) => n.id === id);

	if (!notification) {
		return (
			<>
				<Header label="Notification" />
				<main className="p-4">
					<div>Notification not found</div>
				</main>
			</>
		);
	}

	return (
		<>
			<Header label="Notification" />
			<main className="p-4">
				<div className="rounded-lg border p-4">
					<div className="font-medium">{notification.sender.username}</div>
					<div className="mt-2 text-foreground/80 text-sm">
						{notification.type === "mention" && "mentioned you"}
						{notification.type === "like" && "liked your post"}
					</div>
					{notification.data && (
						<div className="mt-2 text-sm">
							<pre>{JSON.stringify(notification.data, null, 2)}</pre>
						</div>
					)}
				</div>
			</main>
		</>
	);
}
