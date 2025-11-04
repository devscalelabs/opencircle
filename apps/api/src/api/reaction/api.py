from fastapi import APIRouter, Depends
from sqlmodel import Session

from src.api.account.api import get_current_user
from src.database.engine import get_session
from src.database.models import User
from src.modules.notifications.notification_tasks import create_notification_task
from src.modules.post.post_methods import get_post
from src.modules.reaction.reaction_methods import create_reaction, get_reactions_by_post

from .serializer import (
    ReactionCreate,
    ReactionRemovedResponse,
    ReactionResponse,
    ReactionsByEmojiResponse,
)

router = APIRouter()


@router.post("/reactions/", response_model=ReactionResponse | ReactionRemovedResponse)
def create_reaction_endpoint(
    reaction: ReactionCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    reaction_data = reaction.model_dump()
    reaction_data["user_id"] = current_user.id
    created_reaction = create_reaction(db, reaction_data)
    if created_reaction is None:
        return {"message": "Reaction removed"}

    # Create notification for post owner when reaction is created
    post = get_post(db, created_reaction.post_id)
    if post and post.user_id != current_user.id:
        create_notification_task.delay(
            recipient_id=post.user_id,
            sender_id=current_user.id,
            notification_type="like",
            data={
                "post_id": post.id,
                "emoji": created_reaction.emoji,
            },
        )

    # Manually construct response to avoid circular reference with post.reactions
    return {
        "id": created_reaction.id,
        "user_id": created_reaction.user_id,
        "post_id": created_reaction.post_id,
        "emoji": created_reaction.emoji,
        "user": created_reaction.user,
        "created_at": created_reaction.created_at,
        "updated_at": created_reaction.updated_at,
    }


@router.get("/reactions/{post_id}", response_model=list[ReactionsByEmojiResponse])
def get_reactions_endpoint(
    post_id: str,
    db: Session = Depends(get_session),
):
    """Get all reactions for a post grouped by emoji with user details."""
    return get_reactions_by_post(db, post_id)


@router.delete("/reactions/", response_model=ReactionRemovedResponse)
def delete_reaction_endpoint(
    post_id: str,
    emoji: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    from src.modules.reaction.reaction_methods import delete_reaction

    success = delete_reaction(db, current_user.id, post_id, emoji)
    if success:
        return {"message": "Reaction deleted"}
    else:
        return {"message": "Reaction not found"}
