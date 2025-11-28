from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Session, select

from src.database.models import Media


def soft_delete(db: Session, record) -> None:
    """Soft delete a record by setting deleted_at timestamp."""
    record.deleted_at = datetime.now(timezone.utc)
    db.add(record)


def create_media(db: Session, media_data: dict) -> Media:
    """Create a new media."""
    media = Media(**media_data)
    db.add(media)
    db.commit()
    db.refresh(media)
    return media


def get_media(db: Session, media_id: str) -> Optional[Media]:
    """Get a media by ID."""
    statement = select(Media).where(Media.id == media_id, Media.deleted_at.is_(None))
    return db.exec(statement).first()


def update_media(db: Session, media_id: str, update_data: dict) -> Optional[Media]:
    """Update a media by ID."""
    media = db.get(Media, media_id)
    if not media:
        return None
    for key, value in update_data.items():
        setattr(media, key, value)
    db.commit()
    db.refresh(media)
    return media


def delete_media(db: Session, media_id: str) -> bool:
    """Soft delete a media by ID."""
    media = db.get(Media, media_id)
    if not media:
        return False
    soft_delete(db, media)
    db.commit()
    return True


def get_medias_by_post(db: Session, post_id: str) -> list[Media]:
    """Get all medias for a post."""
    statement = select(Media).where(
        Media.post_id == post_id, Media.deleted_at.is_(None)
    )
    return list(db.exec(statement).all())


def get_medias_by_user(db: Session, user_id: str) -> list[Media]:
    """Get all medias for a user."""
    statement = select(Media).where(
        Media.user_id == user_id, Media.deleted_at.is_(None)
    )
    return list(db.exec(statement).all())


def get_all_medias(db: Session, skip: int = 0, limit: int = 100) -> list[Media]:
    """Get all medias with pagination."""
    statement = (
        select(Media).where(Media.deleted_at.is_(None)).offset(skip).limit(limit)
    )
    return list(db.exec(statement).all())
