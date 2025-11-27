from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from loguru import logger
from sqlmodel import Session

from src.api.account.api import get_current_user
from src.api.post.serializer import PostResponse
from src.database.engine import get_session
from src.database.models import User
from src.modules.notifications.notification_tasks import create_notification_task
from src.modules.post.post_methods import (
    create_post,
    delete_post,
    get_all_nested_posts_by_parent_id,
    get_all_posts,
    get_comment_summary,
    get_post,
    get_posts_by_channel_slug,
    get_posts_by_type,
    get_posts_by_user,
    get_reactions_summary,
    update_post,
)
from src.modules.post.post_utils import extract_mention
from src.modules.user.user_methods import get_user_by_username

from .serializer import PostCreate, PostUpdate

router = APIRouter()
security = HTTPBearer(auto_error=False)


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_session),
) -> Optional[User]:
    """Get current user from JWT token if provided, otherwise return None."""
    if not credentials:
        return None

    try:
        import jwt

        from src.core.settings import settings
        from src.modules.user.user_methods import get_user_by_username

        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        username: str = payload.get("sub")
        if username is None:
            return None

        user = get_user_by_username(db, username)
        return user
    except Exception:
        return None


def build_post_response_data(post, current_user_id: Optional[str], db: Session) -> dict:
    """Helper function to build post response data with relationships and reactions."""
    return {
        "id": post.id,
        "content": post.content,
        "type": post.type,
        "user_id": post.user_id,
        "channel_id": post.channel_id,
        "parent_id": post.parent_id,
        "is_pinned": post.is_pinned,
        "user": post.user,
        "channel": post.channel,
        "medias": post.medias,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
        "comment_count": post.comment_count,
        "reaction_count": post.reaction_count,
        "reactions": get_reactions_summary(db, post.id, current_user_id),
        "comment_summary": get_comment_summary(db, post.id, current_user_id),
    }


@router.post("/posts/", response_model=PostResponse)
def create_post_endpoint(
    post: PostCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    post_data = post.model_dump()

    if post_data.get("channel_id"):
        from src.modules.channels.channels_methods import get_channel, is_member

        channel = get_channel(db, post_data["channel_id"])
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        if channel.type == "private":
            if not is_member(db, channel.id, current_user.id):
                raise HTTPException(
                    status_code=403, detail="Access denied to private channel"
                )

    created_post = create_post(db, post_data)

    original_post_id = None
    parent_post = None
    if post_data.get("parent_id"):
        parent_post = get_post(db, post_data["parent_id"])
        current_parent = parent_post
        while current_parent and current_parent.parent_id:
            current_parent = get_post(db, current_parent.parent_id)
        original_post_id = (
            current_parent.id if current_parent else post_data["parent_id"]
        )

    if parent_post and parent_post.user_id != current_user.id:
        create_notification_task.delay(  # type: ignore
            recipient_id=parent_post.user_id,
            sender_id=current_user.id,
            notification_type="reply",
            data={
                "post_id": created_post.id,
                "content": post_data.get("content", ""),
                "original_post_id": original_post_id,
            },
        )

    if post_data.get("content"):
        mentions = extract_mention(post_data["content"])
        logger.info(mentions)
        if mentions:
            for username in mentions:
                mentioned_user = get_user_by_username(db, username)
                if mentioned_user and mentioned_user.id != current_user.id:
                    if parent_post and mentioned_user.id == parent_post.user_id:
                        continue
                    create_notification_task.delay(  # type: ignore
                        recipient_id=mentioned_user.id,
                        sender_id=current_user.id,
                        notification_type="mention",
                        data={
                            "post_id": created_post.id,
                            "content": post_data["content"],
                            "original_post_id": original_post_id,
                        },
                    )

    full_post = get_post(db, created_post.id)
    post_response_data = build_post_response_data(full_post, current_user.id, db)
    return PostResponse(**post_response_data)


@router.post("/posts/with-files/", response_model=PostResponse)
def create_post_with_files_endpoint(
    post: str = Form(...),
    files: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    import json

    post_data = json.loads(post)

    if post_data.get("channel_id"):
        from src.modules.channels.channels_methods import get_channel, is_member

        channel = get_channel(db, post_data["channel_id"])
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        if channel.type == "private":
            if not is_member(db, channel.id, current_user.id):
                raise HTTPException(
                    status_code=403, detail="Access denied to private channel"
                )

    created_post = create_post(db, post_data, files)

    original_post_id = None
    parent_post = None
    if post_data.get("parent_id"):
        parent_post = get_post(db, post_data["parent_id"])
        current_parent = parent_post
        while current_parent and current_parent.parent_id:
            current_parent = get_post(db, current_parent.parent_id)
        original_post_id = (
            current_parent.id if current_parent else post_data["parent_id"]
        )

    if parent_post and parent_post.user_id != current_user.id:
        create_notification_task.delay(  # type: ignore
            recipient_id=parent_post.user_id,
            sender_id=current_user.id,
            notification_type="reply",
            data={
                "post_id": created_post.id,
                "content": post_data.get("content", ""),
                "original_post_id": original_post_id,
            },
        )

    if post_data.get("content"):
        mentions = extract_mention(post_data["content"])
        if mentions:
            for username in mentions:
                mentioned_user = get_user_by_username(db, username)
                if mentioned_user and mentioned_user.id != current_user.id:
                    if parent_post and mentioned_user.id == parent_post.user_id:
                        continue
                    create_notification_task.delay(  # type: ignore
                        recipient_id=mentioned_user.id,
                        sender_id=current_user.id,
                        notification_type="mention",
                        data={
                            "post_id": created_post.id,
                            "content": post_data["content"],
                            "original_post_id": original_post_id,
                        },
                    )

    full_post = get_post(db, created_post.id)
    post_response_data = build_post_response_data(full_post, current_user.id, db)
    return PostResponse(**post_response_data)


@router.get("/posts/{post_id}", response_model=PostResponse)
def get_post_endpoint(
    post_id: str,
    db: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    post = get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.channel_id:
        from src.modules.channels.channels_methods import get_channel, is_member

        channel = get_channel(db, post.channel_id)
        if channel and channel.type == "private":
            if not current_user or not is_member(db, channel.id, current_user.id):
                raise HTTPException(
                    status_code=403, detail="Access denied to private channel post"
                )

    current_user_id = current_user.id if current_user else None
    post_response_data = build_post_response_data(post, current_user_id, db)
    return PostResponse(**post_response_data)


@router.get("/posts/", response_model=List[PostResponse])
def get_all_posts_endpoint(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[str] = None,
    post_type: Optional[str] = None,
    parent_id: Optional[str] = None,
    channel_slug: Optional[str] = None,
    db: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    if channel_slug:
        from src.modules.channels.channels_methods import get_channel_by_slug, is_member

        channel = get_channel_by_slug(db, channel_slug)
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        if channel.type == "private":
            if not current_user or not is_member(db, channel.id, current_user.id):
                raise HTTPException(
                    status_code=403, detail="Access denied to private channel"
                )

    current_user_id = current_user.id if current_user else None

    if user_id:
        posts = get_posts_by_user(db, user_id, current_user_id)
    elif post_type:
        posts = get_posts_by_type(db, post_type, current_user_id)
    elif parent_id:
        posts = get_all_nested_posts_by_parent_id(db, parent_id, current_user_id)
    elif channel_slug:
        posts = get_posts_by_channel_slug(db, channel_slug)
    else:
        posts = get_all_posts(db, skip, limit, current_user_id)
    response_posts = []
    for post in posts:
        post_response_data = build_post_response_data(post, current_user_id, db)
        response_posts.append(PostResponse(**post_response_data))
    return response_posts


@router.put("/posts/{post_id}", response_model=PostResponse)
def update_post_endpoint(
    post_id: str,
    post: PostUpdate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    existing_post = get_post(db, post_id)
    if not existing_post:
        raise HTTPException(status_code=404, detail="Post not found")

    if existing_post.channel_id:
        from src.modules.channels.channels_methods import get_channel, is_member

        channel = get_channel(db, existing_post.channel_id)
        if channel and channel.type == "private":
            if not is_member(db, channel.id, current_user.id):
                raise HTTPException(
                    status_code=403, detail="Access denied to private channel post"
                )

    update_data = {k: v for k, v in post.model_dump().items() if v is not None}
    updated_post = update_post(db, post_id, update_data)
    if not updated_post:
        raise HTTPException(status_code=404, detail="Post not found")

    full_post = get_post(db, updated_post.id)
    post_response_data = build_post_response_data(full_post, current_user.id, db)
    return PostResponse(**post_response_data)


@router.delete("/posts/{post_id}")
def delete_post_endpoint(
    post_id: str,
    db: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    post = get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.channel_id:
        from src.modules.channels.channels_methods import get_channel, is_member

        channel = get_channel(db, post.channel_id)
        if channel and channel.type == "private":
            if not current_user or not is_member(db, channel.id, current_user.id):
                raise HTTPException(
                    status_code=403, detail="Access denied to private channel post"
                )

    if not delete_post(db, post_id):
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted"}
