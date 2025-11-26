from collections import defaultdict
from typing import Optional

from sqlalchemy.orm import joinedload
from sqlmodel import Session, select

from src.database.models import Reaction


def create_reaction(db: Session, reaction_data: dict) -> Optional[Reaction]:
    """Create or toggle a reaction."""
    user_id = reaction_data["user_id"]
    post_id = reaction_data["post_id"]
    emoji = reaction_data["emoji"]

    existing = db.exec(
        select(Reaction).where(Reaction.user_id == user_id, Reaction.post_id == post_id)
    ).first()

    if existing:
        if existing.emoji == emoji:
            db.delete(existing)
            db.commit()
            return None
        else:
            existing.emoji = emoji
            db.commit()
            db.refresh(existing)
            return existing
    else:
        reaction = Reaction(**reaction_data)
        db.add(reaction)
        db.commit()
        db.refresh(reaction)
        return reaction


def delete_reaction(db: Session, user_id: str, post_id: str, emoji: str) -> bool:
    """Delete a specific reaction."""
    existing = db.exec(
        select(Reaction).where(
            Reaction.user_id == user_id,
            Reaction.post_id == post_id,
            Reaction.emoji == emoji,
        )
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return True
    return False


def get_reactions_by_post(db: Session, post_id: str) -> list[dict]:
    """Get all reactions for a post grouped by emoji with user details."""
    reactions = (
        db.exec(
            select(Reaction)
            .where(Reaction.post_id == post_id)
            .options(joinedload(Reaction.user))
        )
        .unique()
        .all()
    )

    reactions_by_emoji = defaultdict(list)
    for reaction in reactions:
        reactions_by_emoji[reaction.emoji].append(reaction)

    result = []
    for emoji, emoji_reactions in reactions_by_emoji.items():
        result.append(
            {
                "emoji": emoji,
                "count": len(emoji_reactions),
                "users": [
                    {
                        "id": r.id,
                        "user_id": r.user_id,
                        "emoji": r.emoji,
                        "user": r.user,
                    }
                    for r in emoji_reactions
                ],
            }
        )

    return result
