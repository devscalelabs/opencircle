import { useEffect, useRef } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationItem } from "./notificationItem";
import { NotificationListSkeleton } from "./notificationListSkeleton";

interface NotificationListProps {
	limit?: number;
}

export const NotificationList = ({ limit = 20 }: NotificationListProps) => {
	const {
		notifications,
		isNotificationsLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useNotifications(limit);

	const observerTarget = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 1.0 },
		);

		const currentTarget = observerTarget.current;
		if (currentTarget) {
			observer.observe(currentTarget);
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	if (isNotificationsLoading) {
		return <NotificationListSkeleton />;
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
			{hasNextPage && (
				<div ref={observerTarget} className="p-4 text-center">
					{isFetchingNextPage ? (
						<div className="text-muted-foreground text-sm">Loading more...</div>
					) : (
						<div className="h-4" />
					)}
				</div>
			)}
		</div>
	);
};
