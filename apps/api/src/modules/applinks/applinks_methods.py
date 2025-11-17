from typing import List, Optional

from sqlmodel import Session, desc, select

from src.database.models import AppLink


def create_app_link(db: Session, app_link_data: dict) -> AppLink:
    """Create a new app link."""
    app_link = AppLink(**app_link_data)
    db.add(app_link)
    db.commit()
    db.refresh(app_link)
    return app_link


def get_app_link(db: Session, app_link_id: str) -> Optional[AppLink]:
    """Get an app link by ID."""
    statement = select(AppLink).where(AppLink.id == app_link_id)
    app_link = db.exec(statement).first()
    return app_link


def update_app_link(
    db: Session, app_link_id: str, update_data: dict
) -> Optional[AppLink]:
    """Update an app link by ID."""
    app_link = db.get(AppLink, app_link_id)
    if not app_link:
        return None
    for key, value in update_data.items():
        setattr(app_link, key, value)
    db.commit()
    db.refresh(app_link)
    return app_link


def delete_app_link(db: Session, app_link_id: str) -> bool:
    """Delete an app link by ID."""
    app_link = db.get(AppLink, app_link_id)
    if not app_link:
        return False
    db.delete(app_link)
    db.commit()
    return True


def get_all_app_links(db: Session, skip: int = 0, limit: int = 100) -> List[AppLink]:
    """Get all app links with pagination."""
    statement = (
        select(AppLink).order_by(desc(AppLink.created_at)).offset(skip).limit(limit)
    )
    app_links = list(db.exec(statement).all())
    return app_links
