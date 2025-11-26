from typing import Optional

from sqlmodel import Session

from src.core.celery_app import celery_app
from src.database.engine import engine
from src.database.models import NotificationType
from src.modules.notifications.notifications_methods import create_notification


@celery_app.task
def create_notification_task(
    recipient_id: str,
    sender_id: str,
    notification_type: str,
    data: Optional[dict] = None,
):
    """Create a notification as a background task."""
    if recipient_id == sender_id:
        return {
            "success": True,
            "message": "Notification skipped - recipient and sender are the same",
        }

    with Session(engine) as db:
        try:
            notification_type_enum = NotificationType(notification_type)

            notification = create_notification(
                db=db,
                recipient_id=recipient_id,
                sender_id=sender_id,
                notification_type=notification_type_enum,
                data=data,
            )

            return {
                "success": True,
                "notification_id": notification.id,
                "message": "Notification created successfully",
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to create notification",
            }
