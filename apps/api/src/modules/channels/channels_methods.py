from typing import List, Optional

from sqlmodel import Session, asc, select

from src.database.models import Channel, ChannelMember


def create_channel(db: Session, channel_data: dict) -> Channel:
    """Create a new channel."""
    channel = Channel(**channel_data)
    db.add(channel)
    db.commit()
    db.refresh(channel)
    return channel


def get_channel(db: Session, channel_id: str) -> Optional[Channel]:
    """Get a channel by ID."""
    return db.get(Channel, channel_id)


def get_channel_by_slug(db: Session, slug: str) -> Optional[Channel]:
    """Get a channel by slug."""
    statement = select(Channel).where(Channel.slug == slug)
    return db.exec(statement).first()


def update_channel(
    db: Session, channel_id: str, update_data: dict
) -> Optional[Channel]:
    """Update a channel by ID."""
    channel = db.get(Channel, channel_id)
    if not channel:
        return None
    for key, value in update_data.items():
        setattr(channel, key, value)
    db.commit()
    db.refresh(channel)
    return channel


def delete_channel(db: Session, channel_id: str) -> bool:
    """Delete a channel by ID."""
    channel = db.get(Channel, channel_id)
    if not channel:
        return False
    db.delete(channel)
    db.commit()
    return True


def get_all_channels(
    db: Session, skip: int = 0, limit: int = 100, user_id: Optional[str] = None
) -> List[Channel]:
    """Get all channels with pagination - all public and private channels."""
    # Get all channels (public and private) with pagination, ordered by type (public first, then private)
    statement = (
        select(Channel).order_by(asc(Channel.created_at)).offset(skip).limit(limit)
    )
    return list(db.exec(statement).all())


def add_member(db: Session, channel_id: str, user_id: str) -> Optional[ChannelMember]:
    """Add a member to a channel."""
    # Check if already a member
    existing = db.exec(
        select(ChannelMember).where(
            ChannelMember.channel_id == channel_id, ChannelMember.user_id == user_id
        )
    ).first()
    if existing:
        return existing

    member = ChannelMember(channel_id=channel_id, user_id=user_id)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


def remove_member(db: Session, channel_id: str, user_id: str) -> bool:
    """Remove a member from a channel."""
    member = db.exec(
        select(ChannelMember).where(
            ChannelMember.channel_id == channel_id, ChannelMember.user_id == user_id
        )
    ).first()
    if not member:
        return False
    db.delete(member)
    db.commit()
    return True


def get_channel_members(db: Session, channel_id: str) -> List[ChannelMember]:
    """Get all members of a channel."""
    statement = select(ChannelMember).where(ChannelMember.channel_id == channel_id)
    return list(db.exec(statement).all())


def is_member(db: Session, channel_id: str, user_id: str) -> bool:
    """Check if a user is a member of a channel."""
    return (
        db.exec(
            select(ChannelMember).where(
                ChannelMember.channel_id == channel_id, ChannelMember.user_id == user_id
            )
        ).first()
        is not None
    )
