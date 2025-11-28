from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from src.api.account.api import get_current_user
from src.api.resources.serializer import ResourceResponse
from src.database.engine import get_session as get_db
from src.database.models import Role, User
from src.modules.channels.channels_methods import (
    create_channel,
    delete_channel,
    get_all_channels,
    get_channel,
    is_member,
    update_channel,
)
from src.modules.resources.resources_methods import (
    get_resources_by_channel,
)

from .serializer import ChannelCreate, ChannelResponse, ChannelUpdate

router = APIRouter()
security = HTTPBearer(auto_error=False)


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
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


@router.post("/channels/", response_model=ChannelResponse)
def create_channel_endpoint(
    channel: ChannelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    channel_data = channel.model_dump()
    return create_channel(db, channel_data)


@router.get("/channels/{channel_id}", response_model=ChannelResponse)
def get_channel_endpoint(
    channel_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    channel = get_channel(db, channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    # Check if user has access to this channel
    # Public channels are accessible to everyone
    # Private channels require membership (admins can access all)
    if channel.type == "private":
        from src.modules.channels.channels_methods import is_member

        is_admin = current_user and current_user.role == Role.ADMIN
        if not is_admin and (
            not current_user or not is_member(db, channel_id, current_user.id)
        ):
            raise HTTPException(
                status_code=403, detail="Access denied to private channel"
            )

    return channel


@router.get("/channels/", response_model=List[ChannelResponse])
def get_all_channels_endpoint(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    user_id = current_user.id if current_user else None
    return get_all_channels(db, skip, limit, user_id)


@router.put("/channels/{channel_id}", response_model=ChannelResponse)
def update_channel_endpoint(
    channel_id: str,
    channel: ChannelUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check if user has access to this channel before updating
    existing_channel = get_channel(db, channel_id)
    if not existing_channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    if existing_channel.type == "private":
        from src.modules.channels.channels_methods import is_member

        is_admin = current_user.role == Role.ADMIN
        if not is_admin and not is_member(db, channel_id, current_user.id):
            raise HTTPException(
                status_code=403, detail="Access denied to private channel"
            )

    update_data = {k: v for k, v in channel.model_dump().items() if v is not None}
    updated_channel = update_channel(db, channel_id, update_data)
    if not updated_channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    return updated_channel


@router.delete("/channels/{channel_id}")
def delete_channel_endpoint(
    channel_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check if user has access to this channel before deleting
    existing_channel = get_channel(db, channel_id)
    if not existing_channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    if existing_channel.type == "private":
        from src.modules.channels.channels_methods import is_member

        is_admin = current_user.role == Role.ADMIN
        if not is_admin and not is_member(db, channel_id, current_user.id):
            raise HTTPException(
                status_code=403, detail="Access denied to private channel"
            )

    if not delete_channel(db, channel_id):
        raise HTTPException(status_code=404, detail="Channel not found")
    return {"message": "Channel deleted"}


@router.get(
    "/channels/{channel_slug}/resources/", response_model=List[ResourceResponse]
)
def get_resources_by_channel_endpoint(
    channel_slug: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    from src.modules.channels.channels_methods import get_channel_by_slug

    channel = get_channel_by_slug(db, channel_slug)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    if channel.type == "private":
        is_admin = current_user and current_user.role == Role.ADMIN
        if not is_admin and (
            not current_user or not is_member(db, channel.id, current_user.id)
        ):
            raise HTTPException(
                status_code=403, detail="Access denied to private channel"
            )

    return get_resources_by_channel(db, channel.id)
