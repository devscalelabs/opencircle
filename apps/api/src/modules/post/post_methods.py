from collections import Counter
from datetime import datetime, timezone
from typing import List, Optional, cast

from fastapi import UploadFile
from sqlalchemy import Column, desc, text
from sqlalchemy.orm import joinedload
from sqlmodel import Session, select

from src.database.models import Channel, Media, Post, Reaction, User
from src.modules.channels.channels_methods import is_member
from src.modules.storages.storage_methods import upload_file


def soft_delete(db: Session, record) -> None:
    """Soft delete a record by setting deleted_at timestamp."""
    record.deleted_at = datetime.now(timezone.utc)
    db.add(record)


def filter_private_channel_posts(
    posts: list[Post],
    current_user_id: Optional[str] = None,
    db: Optional[Session] = None,
) -> list[Post]:
    """Filter out posts from private channels where user is not a member."""
    filtered_posts = []
    for post in posts:
        if not post.channel_id:
            filtered_posts.append(post)
            continue

        if post.channel and post.channel.type != "private":
            filtered_posts.append(post)
            continue

        if not current_user_id or not db:
            continue

        if post.channel and is_member(db, post.channel_id, current_user_id):
            filtered_posts.append(post)

    return filtered_posts


def create_post(
    db: Session, post_data: dict, files: Optional[List[UploadFile]] = None
) -> Post:
    """Create a new post."""
    post = Post(**post_data)
    db.add(post)
    db.commit()
    db.refresh(post)

    if files:
        for file in files:
            url = upload_file(file)
            media = Media(url=url, post_id=post.id, user_id=post.user_id)
            db.add(media)
        db.commit()
        db.refresh(post)

    return post


def get_post(db: Session, post_id: str) -> Optional[Post]:
    """Get a post by ID."""
    statement = (
        select(Post)
        .options(
            joinedload(Post.user), joinedload(Post.channel), joinedload(Post.medias)
        )
        .where(Post.id == post_id, Post.deleted_at.is_(None))
    )  # type: ignore
    post = db.exec(statement).unique().first()
    return post


def update_post(db: Session, post_id: str, update_data: dict) -> Optional[Post]:
    """Update a post by ID."""
    post = db.get(Post, post_id)
    if not post:
        return None
    for key, value in update_data.items():
        setattr(post, key, value)
    db.commit()
    db.refresh(post)
    return post


def delete_post(db: Session, post_id: str) -> bool:
    """Soft delete a post by ID."""
    post = db.get(Post, post_id)
    if not post:
        return False

    from src.database.models import Media, Reaction

    media_statement = select(Media).where(Media.post_id == post_id)
    media_records = db.exec(media_statement).all()
    for media in media_records:
        soft_delete(db, media)

    reaction_statement = select(Reaction).where(Reaction.post_id == post_id)
    reaction_records = db.exec(reaction_statement).all()
    for reaction in reaction_records:
        soft_delete(db, reaction)

    replies_statement = select(Post).where(Post.parent_id == post_id)
    replies_records = db.exec(replies_statement).all()
    for reply in replies_records:
        delete_post(db, reply.id)

    soft_delete(db, post)
    db.commit()
    return True


def get_posts_by_user(
    db: Session, user_id: str, current_user_id: Optional[str] = None
) -> list[Post]:
    """Get all posts for a user, filtering out private channel posts for non-members."""
    statement = (
        select(Post)
        .options(
            joinedload(Post.user), joinedload(Post.channel), joinedload(Post.medias)
        )
        .where(Post.user_id == user_id, Post.deleted_at.is_(None))
        .order_by(desc(Post.created_at))
    )  # type: ignore
    all_posts = list(db.exec(statement).unique().all())
    return filter_private_channel_posts(all_posts, current_user_id, db)


def get_posts_by_type(
    db: Session, post_type: str, current_user_id: Optional[str] = None
) -> list[Post]:
    """Get all posts of a specific type, filtering out private channel posts for non-members."""
    statement = (
        select(Post)
        .options(
            joinedload(Post.user), joinedload(Post.channel), joinedload(Post.medias)
        )
        .where(Post.type == post_type, Post.deleted_at.is_(None))
        .order_by(desc(Post.created_at))
    )  # type: ignore
    all_posts = list(db.exec(statement).all())
    return filter_private_channel_posts(all_posts, current_user_id, db)


def get_posts_by_parent_id(db: Session, parent_id: str) -> list[Post]:
    """Get all posts that are replies to a specific post."""
    statement = (
        select(Post)
        .options(
            joinedload(Post.user), joinedload(Post.channel), joinedload(Post.medias)
        )
        .where(Post.parent_id == parent_id, Post.deleted_at.is_(None))
        .order_by(desc(Post.is_pinned), desc(Post.created_at))  # type: ignore
    )
    posts = list(db.exec(statement).all())
    return posts


def get_all_nested_posts_by_parent_id(
    db: Session, parent_id: str, current_user_id: Optional[str] = None
) -> list[Post]:
    """Get all nested posts by parent ID."""
    from src.database.models import PostType, Role

    sql = """
    WITH RECURSIVE reply_tree AS (
        -- Base case: Get direct replies to the parent post
        SELECT p.id, p.parent_id, p.created_at, p.is_pinned, p.updated_at, p.content, p.type, p.user_id, p.channel_id, 1 as depth,
               CAST((CASE WHEN p.is_pinned THEN 1 ELSE 0 END) AS TEXT) || '/' ||
               CAST(2147483647 - EXTRACT(EPOCH FROM p.created_at) AS TEXT) as sort_path
        FROM post p
        WHERE p.parent_id = :parent_id AND p.deleted_at IS NULL
        UNION ALL
        -- Recursive case: Get replies to any reply in the tree
        SELECT p.id, p.parent_id, p.created_at, p.is_pinned, p.updated_at, p.content, p.type, p.user_id, p.channel_id, rt.depth + 1,
               rt.sort_path || '/' || CAST(EXTRACT(EPOCH FROM p.created_at) AS TEXT)
        FROM post p
        INNER JOIN reply_tree rt ON p.parent_id = rt.id
        WHERE p.deleted_at IS NULL
    )
    SELECT rt.*,
           u.id as user_id, u.username, u.name, u.bio, u.email, u.is_active, u.is_verified, u.avatar_url, u.role, u.created_at as user_created_at, u.updated_at as user_updated_at,
           m.id as media_id, m.url as media_url, m.user_id as media_user_id, m.created_at as media_created_at, m.updated_at as media_updated_at
    FROM reply_tree rt
    LEFT JOIN "user" u ON rt.user_id = u.id AND u.deleted_at IS NULL
    LEFT JOIN media m ON rt.id = m.post_id AND m.deleted_at IS NULL
    ORDER BY rt.sort_path ASC;
    """
    result = db.exec(text(sql).bindparams(parent_id=parent_id))

    posts_dict = {}
    for row in result.all():
        post_id = row.id

        user = None
        if row.user_id:
            user_dict = {
                "id": row.user_id,
                "username": row.username,
                "name": row.name,
                "bio": row.bio,
                "email": row.email,
                "is_active": row.is_active,
                "is_verified": row.is_verified,
                "avatar_url": row.avatar_url,
                "role": Role(row.role.lower()) if row.role else Role.USER,
                "created_at": row.user_created_at,
                "updated_at": row.user_updated_at,
            }
            user = User(**user_dict)

        if post_id not in posts_dict:
            post_dict = {
                "id": row.id,
                "parent_id": row.parent_id,
                "created_at": row.created_at,
                "updated_at": row.updated_at,
                "content": row.content,
                "type": PostType(row.type.lower()),
                "user_id": row.user_id,
                "channel_id": row.channel_id,
                "user": user,
                "medias": [],
            }
            posts_dict[post_id] = Post(**post_dict)

        if row.media_id:
            media_dict = {
                "id": row.media_id,
                "url": row.media_url,
                "post_id": post_id,
                "user_id": row.media_user_id,
                "created_at": row.media_created_at,
                "updated_at": row.media_updated_at,
            }
            posts_dict[post_id].medias.append(Media(**media_dict))

    all_posts = list(posts_dict.values())
    return filter_private_channel_posts(all_posts, current_user_id, db)


def get_posts_by_channel_slug(db: Session, channel_slug: str) -> list[Post]:
    """Get all posts for a channel by slug."""
    statement = (
        select(Post)
        .options(
            joinedload(Post.user), joinedload(Post.channel), joinedload(Post.medias)
        )  # type: ignore
        .join(Channel)
        .where(Channel.slug == channel_slug, Post.deleted_at.is_(None))
        .order_by(desc(Post.is_pinned), desc(Post.created_at))
    )
    posts = list(db.exec(statement).unique().all())
    return posts


def get_all_posts(
    db: Session, skip: int = 0, limit: int = 100, current_user_id: Optional[str] = None
) -> list[Post]:
    """Get all posts with pagination, filtering out private channel posts for non-members."""
    statement = (
        select(Post)
        .options(
            joinedload(Post.user), joinedload(Post.channel), joinedload(Post.medias)
        )  # type: ignore
        .where(Post.type == "post", Post.deleted_at.is_(None))
        .order_by(desc(Post.is_pinned), desc(Post.created_at))
        .offset(skip)
        .limit(limit)
    )
    all_posts = list(db.exec(statement).unique().all())
    return filter_private_channel_posts(all_posts, current_user_id, db)


def get_reactions_summary(
    db: Session, post_id: str, current_user_id: Optional[str] = None
) -> dict:
    """Get reactions summary for a post."""
    reactions = db.exec(
        select(Reaction).where(Reaction.post_id == post_id, Reaction.deleted_at.is_(None))
    ).all()
    emoji_counts = Counter(r.emoji for r in reactions)
    user_reactions = {r.emoji for r in reactions if r.user_id == current_user_id}

    summary = [
        {"emoji": emoji, "count": count, "me": emoji in user_reactions}
        for emoji, count in emoji_counts.items()
    ]

    user_reaction_ids = (
        [f"{current_user_id}_emoji_{emoji}" for emoji in user_reactions]
        if current_user_id
        else []
    )

    return {"summary": summary, "user_reaction_ids": user_reaction_ids}


def get_comment_summary(
    db: Session, post_id: str, current_user_id: Optional[str] = None
) -> dict:
    """Get comment summary for a post."""
    sql = """
    WITH RECURSIVE rt AS (
        SELECT id, user_id FROM post WHERE parent_id = :post_id AND deleted_at IS NULL
        UNION ALL
        SELECT p.id, p.user_id FROM post p INNER JOIN rt ON p.parent_id = rt.id WHERE p.deleted_at IS NULL
    )
    SELECT DISTINCT user_id FROM rt WHERE user_id IS NOT NULL
    """
    result = db.exec(text(sql).bindparams(post_id=post_id))
    user_ids = [row.user_id for row in result.all()]

    if not user_ids:
        return {"count": 0, "names": []}

    user_id_col = cast(Column, User.id)
    users = db.exec(select(User).where(user_id_col.in_(user_ids))).all()
    names = [user.name or user.username for user in users]

    me = current_user_id in user_ids if current_user_id else False

    return {"count": len(names), "names": names, "me": me}
