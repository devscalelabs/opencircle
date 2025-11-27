from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from src.api.account.api import get_current_user
from src.database.engine import get_session
from src.database.models import User
from src.modules.notifications.notification_preferences_methods import (
    get_or_create_notification_preferences,
    update_notification_preferences,
)
from src.modules.notifications.notifications_methods import (
    get_notifications_by_user,
    mark_notification_as_read,
)

from .serializer import (
    NotificationPreferencesResponse,
    NotificationPreferencesUpdate,
    NotificationResponse,
)

router = APIRouter()


@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications_endpoint(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Get all notifications for the current user."""
    return get_notifications_by_user(db, current_user.id, skip, limit)


@router.post(
    "/notifications/{notification_id}/read", response_model=NotificationResponse
)
def mark_notification_as_read_endpoint(
    notification_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Mark a notification as read."""
    notification = mark_notification_as_read(db, notification_id)

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    if notification.recipient_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to mark this notification as read"
        )

    return notification


@router.get(
    "/notifications/preferences", response_model=NotificationPreferencesResponse
)
def get_notification_preferences_endpoint(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Get notification preferences for the current user."""
    return get_or_create_notification_preferences(db, current_user.id)


@router.put(
    "/notifications/preferences", response_model=NotificationPreferencesResponse
)
def update_notification_preferences_endpoint(
    preferences: NotificationPreferencesUpdate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Update notification preferences for the current user."""
    return update_notification_preferences(
        db,
        current_user.id,
        mention_email=preferences.mention_email,
        like_email=preferences.like_email,
        reply_email=preferences.reply_email,
    )
