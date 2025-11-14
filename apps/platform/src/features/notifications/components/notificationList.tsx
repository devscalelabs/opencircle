import { useNotifications } from "../hooks/useNotifications";
import { NotificationItem } from "./notificationItem";

interface NotificationListProps {
	skip?: number;
	limit?: number;
}

export const NotificationList = ({
	skip = 0,
	limit = 100,
}: NotificationListProps) => {
	const { notifications, isNotificationsLoading } = useNotifications(
		skip,
		limit,
	);

	if (isNotificationsLoading) {
		return (
			<div className="p-4">
				<div>Loading notifications...</div>
			</div>
		);
	}

	if (notifications.length === 0) {
		return (
			<div className="p-4 text-center text-muted-foreground">
				No notifications yet
			</div>
		);
	}

	return (
		<div className="divide-y divide-border">
			{notifications.map((notification) => (
				<NotificationItem key={notification.id} notification={notification} />
			))}
		</div>
	);
};
