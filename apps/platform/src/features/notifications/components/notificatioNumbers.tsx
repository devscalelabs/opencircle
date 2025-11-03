import { useNotifications } from "../hooks/useNotifications";

export const NotificationNumbers = () => {
	const { notifications } = useNotifications();

	if (
		notifications.filter((notification) => notification.is_read === false)
			.length === 0
	) {
		return null;
	}

	if (
		notifications.filter((notification) => notification.is_read === false)
			.length > 99
	) {
		return (
			<div className="ml-1 flex size-5 items-center justify-center rounded-md bg-primary font-medium text-[9px]">
				99+
			</div>
		);
	}

	return (
		<div className="ml-1 flex size-5 items-center justify-center rounded-md bg-primary font-medium text-[9px]">
			{
				notifications.filter((notification) => notification.is_read === false)
					.length
			}
		</div>
	);
};
