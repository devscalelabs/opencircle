import type { Notification } from "@opencircle/core";
import { Avatar, Button } from "@opencircle/ui";
import { useNavigate } from "@tanstack/react-router";
import moment from "moment";
import { renderContent } from "../../posts/utils/contentRendering";
import { useMarkNotificationAsRead } from "../hooks/useNotifications";

interface NotificationItemProps {
	notification: Notification;
}

export const NotificationItem = ({ notification }: NotificationItemProps) => {
	const navigate = useNavigate();
	const { markAsRead, isMarkingAsRead } = useMarkNotificationAsRead();

	const getTimeAgo = (dateString: string) => {
		try {
			return moment.utc(dateString).fromNow();
		} catch {
			return "Unknown time";
		}
	};

	const handleMarkAsRead = () => {
		if (!notification.is_read) {
			markAsRead(notification.id);
		}
	};

	const getNotificationMessage = () => {
		switch (notification.type) {
			case "mention":
				return `${notification.sender.username} mentioned you`;
			case "like":
				return `${notification.sender.username} liked your post`;
			default:
				return `${notification.sender.username} sent you a notification`;
		}
	};

	const handleViewPost = () => {
		const postId = notification.data?.post_id as string;
		if (postId) {
			handleMarkAsRead();
			navigate({ to: "/posts/$id", params: { id: postId } });
		}
	};

	const hasPostId = Boolean(notification.data?.post_id);

	return (
		<main>
			<div
				className="flex gap-3 p-3 transition-colors duration-150 hover:bg-accent"
				style={{ opacity: notification.is_read ? "50%" : "100%" }}
			>
				<Avatar
					image_url={notification.sender.avatar_url || ""}
					initials={notification.sender.username.charAt(0).toUpperCase()}
				/>
				<div className="min-w-0 flex-1 space-y-1">
					<p className="truncate text-foreground text-sm">
						{getNotificationMessage()}
					</p>

					<p className="text-muted-foreground text-xs">
						{getTimeAgo(notification.created_at)}
					</p>
				</div>
				<div className="flex items-start gap-2">
					{hasPostId && (
						<Button
							variant="secondary"
							size="sm"
							onClick={handleViewPost}
							className="text-xs"
						>
							View
						</Button>
					)}
					{!notification.is_read && (
						<>
							<Button
								variant="secondary"
								size="sm"
								onClick={handleMarkAsRead}
								disabled={isMarkingAsRead}
								className="text-xs"
							>
								{isMarkingAsRead ? "Marking..." : "Mark as read"}
							</Button>
							<div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary"></div>
						</>
					)}
				</div>
			</div>
			{hasPostId && (
				<div className="pr-4 pb-4 pl-12">
					<p className="rounded-lg border border-border bg-background-secondary p-3">
						{renderContent(notification.data?.content || "")}
					</p>
				</div>
			)}
		</main>
	);
};
