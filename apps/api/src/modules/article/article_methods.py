from typing import List, Optional

from sqlalchemy import column, desc
from sqlmodel import Session, select

from src.database.models import Post, PostType


def create_article(db: Session, article_data: dict) -> Post:
    """Create a new article."""
    article = Post(
        title=article_data["title"],
        content=article_data["content"],
        type=PostType.ARTICLE,
        user_id=article_data["user_id"],
        channel_id=article_data.get("channel_id"),
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


def get_article(db: Session, article_id: str) -> Optional[Post]:
    """Get an article by ID."""
    statement = select(Post).where(Post.id == article_id, Post.type == PostType.ARTICLE)
    result = db.exec(statement).first()
    return result


def get_all_articles(db: Session, skip: int = 0, limit: int = 100) -> List[Post]:
    """Get all articles with pagination."""
    statement = (
        select(Post)
        .where(Post.type == PostType.ARTICLE)
        .order_by(desc(column("created_at")))
        .offset(skip)
        .limit(limit)
    )
    result = db.exec(statement).all()
    return list(result)


def get_articles_by_user(
    db: Session, user_id: str, skip: int = 0, limit: int = 100
) -> List[Post]:
    """Get all articles by a specific user."""
    statement = (
        select(Post)
        .where(Post.type == PostType.ARTICLE, Post.user_id == user_id)
        .order_by(desc(column("created_at")))
        .offset(skip)
        .limit(limit)
    )
    result = db.exec(statement).all()
    return list(result)


def update_article(db: Session, article_id: str, update_data: dict) -> Optional[Post]:
    """Update an article."""
    statement = select(Post).where(Post.id == article_id, Post.type == PostType.ARTICLE)
    article = db.exec(statement).first()

    if not article:
        return None

    for key, value in update_data.items():
        if value is not None:
            setattr(article, key, value)

    db.commit()
    db.refresh(article)
    return article


def delete_article(db: Session, article_id: str) -> bool:
    """Delete an article."""
    statement = select(Post).where(Post.id == article_id, Post.type == PostType.ARTICLE)
    article = db.exec(statement).first()

    if not article:
        return False

    db.delete(article)
    db.commit()
    return True
