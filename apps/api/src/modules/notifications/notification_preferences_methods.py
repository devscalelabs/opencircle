from typing import Optional

from sqlmodel import Session, select

from src.database.models import (
    NotificationFrequency,
    NotificationPreferences,
)


def get_notification_preferences(
    db: Session, user_id: str
) -> Optional[NotificationPreferences]:
    """Get notification preferences for a user."""
    statement = select(NotificationPreferences).where(
        NotificationPreferences.user_id == user_id
    )
    return db.exec(statement).first()


def get_or_create_notification_preferences(
    db: Session, user_id: str
) -> NotificationPreferences:
    """Get notification preferences for a user, creating default if not exists."""
    preferences = get_notification_preferences(db, user_id)
    if preferences:
        return preferences

    preferences = NotificationPreferences(
        user_id=user_id,
        mention_email=NotificationFrequency.IMMEDIATE,
        like_email=NotificationFrequency.DAILY,
        reply_email=NotificationFrequency.IMMEDIATE,
    )
    db.add(preferences)
    db.commit()
    db.refresh(preferences)
    return preferences


def update_notification_preferences(
    db: Session,
    user_id: str,
    mention_email: Optional[NotificationFrequency] = None,
    like_email: Optional[NotificationFrequency] = None,
    reply_email: Optional[NotificationFrequency] = None,
) -> NotificationPreferences:
    """Update notification preferences for a user."""
    preferences = get_or_create_notification_preferences(db, user_id)

    if mention_email is not None:
        preferences.mention_email = mention_email
    if like_email is not None:
        preferences.like_email = like_email
    if reply_email is not None:
        preferences.reply_email = reply_email

    db.commit()
    db.refresh(preferences)
    return preferences


def get_email_frequency_for_notification_type(
    db: Session, user_id: str, notification_type: str
) -> NotificationFrequency:
    """Get the email frequency setting for a specific notification type."""
    preferences = get_or_create_notification_preferences(db, user_id)

    frequency_map = {
        "mention": preferences.mention_email,
        "like": preferences.like_email,
        "reply": preferences.reply_email,
    }

    return frequency_map.get(notification_type, NotificationFrequency.NONE)
