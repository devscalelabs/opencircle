from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import column, desc
from sqlmodel import Session, select

from src.database.models import (
    Broadcast,
    BroadcastRecipient,
    BroadcastRecipientStatus,
    BroadcastRecipientType,
    BroadcastStatus,
    ChannelMember,
    User,
)


def create_broadcast(db: Session, broadcast_data: dict) -> Broadcast:
    """Create a new broadcast."""
    broadcast = Broadcast(
        subject=broadcast_data["subject"],
        content=broadcast_data["content"],
        recipient_type=broadcast_data.get(
            "recipient_type", BroadcastRecipientType.TEST_EMAIL
        ),
        test_email=broadcast_data.get("test_email"),
        channel_id=broadcast_data.get("channel_id"),
        status=BroadcastStatus.DRAFT,
        created_by=broadcast_data["created_by"],
    )
    db.add(broadcast)
    db.commit()
    db.refresh(broadcast)
    return broadcast


def get_broadcast(db: Session, broadcast_id: str) -> Optional[Broadcast]:
    """Get a broadcast by ID."""
    statement = select(Broadcast).where(
        Broadcast.id == broadcast_id, Broadcast.deleted_at.is_(None)
    )
    result = db.exec(statement).first()
    return result


def get_all_broadcasts(db: Session, skip: int = 0, limit: int = 100) -> List[Broadcast]:
    """Get all broadcasts with pagination."""
    statement = (
        select(Broadcast)
        .where(Broadcast.deleted_at.is_(None))
        .order_by(desc(column("created_at")))
        .offset(skip)
        .limit(limit)
    )
    result = db.exec(statement).all()
    return list(result)


def update_broadcast(
    db: Session, broadcast_id: str, update_data: dict
) -> Optional[Broadcast]:
    """Update a broadcast."""
    broadcast = get_broadcast(db, broadcast_id)
    if not broadcast:
        return None

    for key, value in update_data.items():
        if value is not None:
            setattr(broadcast, key, value)

    db.commit()
    db.refresh(broadcast)
    return broadcast


def delete_broadcast(db: Session, broadcast_id: str) -> bool:
    """Soft delete a broadcast."""
    broadcast = get_broadcast(db, broadcast_id)
    if not broadcast:
        return False

    broadcast.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return True


def get_all_active_users(db: Session) -> List[User]:
    """Get all active users for broadcast."""
    statement = select(User).where(
        User.is_active == True,  # noqa: E712
        User.deleted_at.is_(None),
    )
    result = db.exec(statement).all()
    return list(result)


def get_channel_members_for_broadcast(db: Session, channel_id: str) -> List[User]:
    """Get all active users who are members of a channel."""
    statement = (
        select(User)
        .join(ChannelMember, ChannelMember.user_id == User.id)
        .where(
            ChannelMember.channel_id == channel_id,
            User.is_active == True,  # noqa: E712
            User.deleted_at.is_(None),
        )
    )
    result = db.exec(statement).all()
    return list(result)


def create_broadcast_recipients(
    db: Session, broadcast_id: str, emails: List[dict]
) -> List[BroadcastRecipient]:
    """Create broadcast recipients."""
    recipients = []
    for email_data in emails:
        recipient = BroadcastRecipient(
            broadcast_id=broadcast_id,
            user_id=email_data.get("user_id"),
            email=email_data["email"],
            status=BroadcastRecipientStatus.PENDING,
        )
        db.add(recipient)
        recipients.append(recipient)
    db.commit()
    for r in recipients:
        db.refresh(r)
    return recipients


def update_broadcast_recipient_status(
    db: Session,
    recipient_id: str,
    status: BroadcastRecipientStatus,
    error_message: Optional[str] = None,
) -> Optional[BroadcastRecipient]:
    """Update broadcast recipient status."""
    statement = select(BroadcastRecipient).where(BroadcastRecipient.id == recipient_id)
    recipient = db.exec(statement).first()
    if not recipient:
        return None

    recipient.status = status
    if status == BroadcastRecipientStatus.SENT:
        recipient.sent_at = datetime.now(timezone.utc).isoformat()
    if error_message:
        recipient.error_message = error_message

    db.commit()
    db.refresh(recipient)
    return recipient


def update_broadcast_status(
    db: Session,
    broadcast_id: str,
    status: BroadcastStatus,
    sent_count: int = 0,
    failed_count: int = 0,
) -> Optional[Broadcast]:
    """Update broadcast status and counts."""
    broadcast = get_broadcast(db, broadcast_id)
    if not broadcast:
        return None

    broadcast.status = status
    broadcast.sent_count = sent_count
    broadcast.failed_count = failed_count
    if status == BroadcastStatus.SENT:
        broadcast.sent_at = datetime.now(timezone.utc).isoformat()

    db.commit()
    db.refresh(broadcast)
    return broadcast


def get_pending_recipients(db: Session, broadcast_id: str) -> List[BroadcastRecipient]:
    """Get all pending recipients for a broadcast."""
    statement = select(BroadcastRecipient).where(
        BroadcastRecipient.broadcast_id == broadcast_id,
        BroadcastRecipient.status == BroadcastRecipientStatus.PENDING,
    )
    result = db.exec(statement).all()
    return list(result)
