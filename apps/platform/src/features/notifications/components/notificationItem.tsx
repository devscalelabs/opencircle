import type { Notification } from "@opencircle/core";
import { Avatar, Button } from "@opencircle/ui";
import { Link, useNavigate } from "@tanstack/react-router";
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

	const getNotificationAction = () => {
		switch (notification.type) {
			case "mention":
				return "mentioned you";
			case "like":
				return "liked your post";
			case "reply":
				return "replied to your post";
			default:
				return "sent you a notification";
		}
	};

	const handleViewPost = () => {
		const originalPostId = notification.data?.original_post_id as string;
		const postId = notification.data?.post_id as string;
		const targetPostId = originalPostId || postId;

		if (targetPostId) {
			handleMarkAsRead();
			navigate({ to: "/posts/$id", params: { id: targetPostId } });
		}
	};

	const isContentNotification = ["mention", "reply"].includes(
		notification.type,
	);

	return (
		<main
			className="cursor-pointer transition-colors duration-150 hover:bg-accent"
			style={{ opacity: notification.is_read ? "50%" : "100%" }}
			onClick={handleViewPost}
		>
			<div className="flex gap-3 p-3">
				<Link
					to="/$username"
					params={{ username: notification.sender.username }}
					onClick={(e) => e.stopPropagation()}
				>
					<Avatar
						image_url={notification.sender.avatar_url || ""}
						initials={notification.sender.username.charAt(0).toUpperCase()}
					/>
				</Link>
				<div className="min-w-0 flex-1 space-y-1">
					<p className="truncate text-foreground text-sm">
						<Link
							to="/$username"
							params={{ username: notification.sender.username }}
							className="font-medium hover:underline"
							onClick={(e) => e.stopPropagation()}
						>
							{notification.sender.username}
						</Link>{" "}
						{getNotificationAction()}
					</p>

					<p className="text-muted-foreground text-xs">
						{getTimeAgo(notification.created_at)}
					</p>
				</div>
				<div className="flex items-start gap-2">
					{!notification.is_read && (
						<>
							<Button
								variant="secondary"
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									handleMarkAsRead();
								}}
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
			{isContentNotification && (
				<div className="pr-4 pb-4 pl-12">
					<p className="rounded-lg border border-border bg-background-secondary p-3">
						{renderContent(notification.data?.content || "")}
					</p>
				</div>
			)}
		</main>
	);
};
