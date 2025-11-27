from datetime import datetime, timedelta
from typing import Optional

from loguru import logger
from sqlmodel import Session, select

from src.core.celery_app import celery_app
from src.core.settings import settings
from src.database.engine import engine
from src.database.models import (
    NotificationFrequency,
    NotificationType,
    PendingNotificationEmail,
    User,
)
from src.modules.email.email_service import email_service
from src.modules.notifications.notification_preferences_methods import (
    get_email_frequency_for_notification_type,
)
from src.modules.notifications.notifications_methods import create_notification


def _get_user(db: Session, user_id: str) -> Optional[User]:
    """Get user by ID."""
    return db.get(User, user_id)


def _calculate_scheduled_time(frequency: NotificationFrequency) -> str:
    """Calculate the scheduled time for digest emails."""
    now = datetime.utcnow()
    if frequency == NotificationFrequency.DAILY:
        next_day = now + timedelta(days=1)
        scheduled = next_day.replace(hour=8, minute=0, second=0, microsecond=0)
    elif frequency == NotificationFrequency.WEEKLY:
        days_until_monday = (7 - now.weekday()) % 7
        if days_until_monday == 0:
            days_until_monday = 7
        next_monday = now + timedelta(days=days_until_monday)
        scheduled = next_monday.replace(hour=8, minute=0, second=0, microsecond=0)
    else:
        scheduled = now
    return scheduled.isoformat()


def _queue_pending_email(
    db: Session,
    user_id: str,
    notification_id: str,
    notification_type: NotificationType,
    frequency: NotificationFrequency,
) -> None:
    """Queue a notification email for later digest delivery."""
    scheduled_time = _calculate_scheduled_time(frequency)
    pending_email = PendingNotificationEmail(
        user_id=user_id,
        notification_id=notification_id,
        notification_type=notification_type,
        frequency=frequency,
        scheduled_for=scheduled_time,
        is_sent=False,
    )
    db.add(pending_email)
    db.commit()


def _send_immediate_email(
    db: Session,
    recipient: User,
    sender: User,
    notification_type: str,
    data: Optional[dict],
) -> bool:
    """Send immediate notification email."""
    post_id = data.get("post_id") if data else None
    original_post_id = data.get("original_post_id") if data else None
    target_post_id = original_post_id or post_id

    post_link = None
    if target_post_id:
        post_link = f"{settings.PLATFORM_URL}/posts/{target_post_id}"

    content = data.get("content") if data else None

    return email_service.send_notification_email(
        to_email=recipient.email,
        notification_type=notification_type,
        sender_username=sender.username,
        content=content,
        post_link=post_link,
    )


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

            email_frequency = get_email_frequency_for_notification_type(
                db, recipient_id, notification_type
            )

            recipient = _get_user(db, recipient_id)
            sender = _get_user(db, sender_id)

            email_sent = False
            if recipient and sender and email_frequency != NotificationFrequency.NONE:
                if email_frequency == NotificationFrequency.IMMEDIATE:
                    email_sent = _send_immediate_email(
                        db, recipient, sender, notification_type, data
                    )
                else:
                    _queue_pending_email(
                        db,
                        recipient_id,
                        notification.id,
                        notification_type_enum,
                        email_frequency,
                    )
                    email_sent = True

            return {
                "success": True,
                "notification_id": notification.id,
                "email_sent": email_sent,
                "email_frequency": email_frequency.value if email_frequency else None,
                "message": "Notification created successfully",
            }
        except Exception as e:
            logger.error(f"Failed to create notification: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to create notification",
            }


@celery_app.task
def send_notification_digest(digest_type: str = "daily"):
    """Send notification digest emails (daily or weekly)."""
    frequency = (
        NotificationFrequency.DAILY
        if digest_type == "daily"
        else NotificationFrequency.WEEKLY
    )

    with Session(engine) as db:
        try:
            now = datetime.utcnow()
            statement = select(PendingNotificationEmail).where(
                PendingNotificationEmail.frequency == frequency,
                PendingNotificationEmail.is_sent == False,  # noqa: E712
                PendingNotificationEmail.scheduled_for <= now.isoformat(),
            )
            pending_emails = list(db.exec(statement).all())

            user_notifications: dict = {}
            for pending in pending_emails:
                if pending.user_id not in user_notifications:
                    user_notifications[pending.user_id] = []
                user_notifications[pending.user_id].append(pending)

            sent_count = 0
            for user_id, pending_list in user_notifications.items():
                user = _get_user(db, user_id)
                if not user:
                    continue

                notifications_data = []
                for pending in pending_list:
                    notif = pending.notification
                    if notif:
                        sender = _get_user(db, notif.sender_id)
                        notifications_data.append(
                            {
                                "type": notif.type.value,
                                "sender_username": sender.username
                                if sender
                                else "Someone",
                                "content": notif.data.get("content")
                                if notif.data
                                else None,
                            }
                        )

                if notifications_data:
                    success = email_service.send_notification_digest_email(
                        to_email=user.email,
                        notifications=notifications_data,
                        digest_type=digest_type,
                    )

                    if success:
                        for pending in pending_list:
                            pending.is_sent = True
                        db.commit()
                        sent_count += 1

            return {
                "success": True,
                "sent_count": sent_count,
                "message": f"Sent {sent_count} {digest_type} digest emails",
            }
        except Exception as e:
            logger.error(f"Failed to send digest emails: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to send digest emails",
            }
