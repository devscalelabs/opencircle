from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from src.api.account.api import get_current_user
from src.api.broadcast.serializer import (
    BroadcastCreate,
    BroadcastResponse,
    BroadcastSendTest,
    BroadcastUpdate,
)
from src.database.engine import get_session
from src.database.models import BroadcastRecipientType, BroadcastStatus, Role, User
from src.modules.broadcast.broadcast_methods import (
    create_broadcast,
    create_broadcast_recipients,
    delete_broadcast,
    get_all_active_users,
    get_all_broadcasts,
    get_broadcast,
    get_channel_members_for_broadcast,
    update_broadcast,
    update_broadcast_status,
)
from src.modules.broadcast.broadcast_tasks import send_broadcast_task

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin role for access."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def build_broadcast_response(broadcast) -> dict:
    """Build broadcast response data."""
    return {
        "id": broadcast.id,
        "subject": broadcast.subject,
        "content": broadcast.content,
        "recipient_type": broadcast.recipient_type.value,
        "test_email": broadcast.test_email,
        "channel_id": broadcast.channel_id,
        "channel": broadcast.channel,
        "status": broadcast.status.value,
        "sent_at": broadcast.sent_at,
        "sent_count": broadcast.sent_count,
        "failed_count": broadcast.failed_count,
        "created_by": broadcast.created_by,
        "creator": broadcast.creator,
        "created_at": broadcast.created_at,
        "updated_at": broadcast.updated_at,
    }


@router.post("/broadcasts/", response_model=BroadcastResponse)
def create_broadcast_endpoint(
    broadcast: BroadcastCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    """Create a new broadcast."""
    broadcast_data = broadcast.model_dump()
    broadcast_data["created_by"] = current_user.id

    if broadcast_data.get("recipient_type"):
        broadcast_data["recipient_type"] = BroadcastRecipientType(
            broadcast_data["recipient_type"]
        )

    created_broadcast = create_broadcast(db, broadcast_data)
    full_broadcast = get_broadcast(db, created_broadcast.id)
    return BroadcastResponse(**build_broadcast_response(full_broadcast))


@router.get("/broadcasts/", response_model=List[BroadcastResponse])
def get_all_broadcasts_endpoint(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    """Get all broadcasts."""
    broadcasts = get_all_broadcasts(db, skip, limit)
    return [BroadcastResponse(**build_broadcast_response(b)) for b in broadcasts]


@router.get("/broadcasts/{broadcast_id}", response_model=BroadcastResponse)
def get_broadcast_endpoint(
    broadcast_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    """Get a broadcast by ID."""
    broadcast = get_broadcast(db, broadcast_id)
    if not broadcast:
        raise HTTPException(status_code=404, detail="Broadcast not found")
    return BroadcastResponse(**build_broadcast_response(broadcast))


@router.put("/broadcasts/{broadcast_id}", response_model=BroadcastResponse)
def update_broadcast_endpoint(
    broadcast_id: str,
    broadcast: BroadcastUpdate,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    """Update a broadcast."""
    existing = get_broadcast(db, broadcast_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Broadcast not found")

    if existing.status != BroadcastStatus.DRAFT:
        raise HTTPException(
            status_code=400, detail="Can only update broadcasts in draft status"
        )

    update_data = {k: v for k, v in broadcast.model_dump().items() if v is not None}
    if update_data.get("recipient_type"):
        update_data["recipient_type"] = BroadcastRecipientType(
            update_data["recipient_type"]
        )

    updated_broadcast = update_broadcast(db, broadcast_id, update_data)
    return BroadcastResponse(**build_broadcast_response(updated_broadcast))


@router.delete("/broadcasts/{broadcast_id}")
def delete_broadcast_endpoint(
    broadcast_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    """Delete a broadcast."""
    if not delete_broadcast(db, broadcast_id):
        raise HTTPException(status_code=404, detail="Broadcast not found")
    return {"message": "Broadcast deleted"}


@router.post("/broadcasts/{broadcast_id}/send-test")
def send_test_broadcast_endpoint(
    broadcast_id: str,
    test_data: BroadcastSendTest,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    """Send a test broadcast to a specific email."""
    broadcast = get_broadcast(db, broadcast_id)
    if not broadcast:
        raise HTTPException(status_code=404, detail="Broadcast not found")

    create_broadcast_recipients(
        db, broadcast_id, [{"email": test_data.test_email, "user_id": None}]
    )

    send_broadcast_task.delay(broadcast_id, is_test=True)

    return {"message": f"Test broadcast queued for {test_data.test_email}"}


@router.post("/broadcasts/{broadcast_id}/send")
def send_broadcast_endpoint(
    broadcast_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    """Send broadcast to users based on recipient type."""
    broadcast = get_broadcast(db, broadcast_id)
    if not broadcast:
        raise HTTPException(status_code=404, detail="Broadcast not found")

    if broadcast.status != BroadcastStatus.DRAFT:
        raise HTTPException(
            status_code=400, detail="Can only send broadcasts in draft status"
        )

    if broadcast.recipient_type == BroadcastRecipientType.CHANNEL_MEMBERS:
        if not broadcast.channel_id:
            raise HTTPException(
                status_code=400,
                detail="Channel ID required for channel members broadcast",
            )
        users = get_channel_members_for_broadcast(db, broadcast.channel_id)
        if not users:
            raise HTTPException(
                status_code=400, detail="No active members in this channel"
            )
    else:
        users = get_all_active_users(db)
        if not users:
            raise HTTPException(status_code=400, detail="No active users to send to")

    recipients_data = [{"email": user.email, "user_id": user.id} for user in users]
    create_broadcast_recipients(db, broadcast_id, recipients_data)

    update_broadcast_status(db, broadcast_id, BroadcastStatus.SENDING)

    send_broadcast_task.delay(broadcast_id, is_test=False)

    return {"message": f"Broadcast queued for {len(users)} users"}
