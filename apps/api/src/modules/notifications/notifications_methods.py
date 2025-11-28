from typing import List, Optional

from sqlalchemy import desc
from sqlmodel import Session, select

from src.database.models import Notification, NotificationType


def create_notification(
    db: Session,
    recipient_id: str,
    sender_id: str,
    notification_type: NotificationType,
    data: Optional[dict] = None,
) -> Notification:
    """Create a new notification."""
    notification = Notification(
        recipient_id=recipient_id,
        sender_id=sender_id,
        type=notification_type,
        data=data,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def get_notifications_by_user(
    db: Session, user_id: str, skip: int = 0, limit: int = 100
) -> List[Notification]:
    """Get all notifications for a user with pagination."""
    statement = (
        select(Notification)
        .where(Notification.recipient_id == user_id, Notification.deleted_at.is_(None))
        .order_by(desc(Notification.created_at))
        .offset(skip)
        .limit(limit)
    )
    notifications = list(db.exec(statement).all())
    return notifications


def mark_notification_as_read(
    db: Session, notification_id: str
) -> Optional[Notification]:
    """Mark a notification as read by ID."""
    notification = db.get(Notification, notification_id)
    if not notification:
        return None

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


def mark_all_notifications_as_read(db: Session, user_id: str) -> int:
    """Mark all notifications for a user as read."""
    statement = select(Notification).where(
        Notification.recipient_id == user_id, not Notification.is_read
    )
    unread_notifications = db.exec(statement).all()

    count = 0
    for notification in unread_notifications:
        notification.is_read = True
        count += 1

    db.commit()
    return count


def get_unread_notification_count(db: Session, user_id: str) -> int:
    """Get the count of unread notifications for a user."""
    statement = select(Notification).where(
        Notification.recipient_id == user_id,
        not Notification.is_read,
        Notification.deleted_at.is_(None),
    )
    notifications = db.exec(statement).all()
    return len(notifications)
