import secrets
import string
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import desc, inspect
from sqlmodel import Session, and_, select

from src.database.models import (
    ChannelMember,
    InviteCode,
    InviteCodeStatus,
    User,
)


def soft_delete(db: Session, record) -> None:
    """Soft delete a record by setting deleted_at timestamp."""
    record.deleted_at = datetime.now(timezone.utc)
    db.add(record)


def generate_invite_code(length: int = 8) -> str:
    """Generate a random invite code."""
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def create_invite_code(
    db: Session,
    code: Optional[str] = None,
    max_uses: int = 1,
    expires_at: Optional[str] = None,
    auto_join_channel_id: Optional[str] = None,
    created_by: str | None = None,
) -> InviteCode:
    """Create a new invite code."""
    if not code:
        code = generate_invite_code()

    # Check if code already exists
    existing = get_invite_code_by_code(db, code)
    if existing:
        raise ValueError(f"Invite code '{code}' already exists")

    invite_code_data = {
        "code": code,
        "max_uses": max_uses,
        "used_count": 0,
        "expires_at": expires_at,
        "status": InviteCodeStatus.ACTIVE,
        "created_by": created_by,
        "auto_join_channel_id": auto_join_channel_id,
    }

    invite_code = InviteCode(**invite_code_data)
    db.add(invite_code)
    db.commit()
    db.refresh(invite_code)
    return invite_code


def get_invite_code(db: Session, invite_code_id: str) -> Optional[InviteCode]:
    """Get an invite code by ID."""
    statement = select(InviteCode).where(
        InviteCode.id == invite_code_id, InviteCode.deleted_at.is_(None)
    )
    return db.exec(statement).first()


def get_invite_code_by_code(db: Session, code: str) -> Optional[InviteCode]:
    """Get an invite code by its code string."""
    statement = select(InviteCode).where(
        InviteCode.code == code, InviteCode.deleted_at.is_(None)
    )
    return db.exec(statement).first()


def get_all_invite_codes(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[InviteCodeStatus] = None,
    created_by: Optional[str] = None,
) -> List[InviteCode]:
    """Get all invite codes with optional filtering."""
    statement = select(InviteCode).where(InviteCode.deleted_at.is_(None))

    filters = []
    if status:
        filters.append(InviteCode.status == status)
    if created_by:
        filters.append(InviteCode.created_by == created_by)

    if filters:
        statement = statement.where(and_(*filters))

    # Get the actual column from the table using inspect
    mapper = inspect(InviteCode)
    created_at_column = mapper.columns.created_at
    statement = statement.offset(skip).limit(limit).order_by(desc(created_at_column))
    return list(db.exec(statement).all())


def update_invite_code(
    db: Session, invite_code_id: str, update_data: dict
) -> Optional[InviteCode]:
    """Update an invite code by ID."""
    invite_code = db.get(InviteCode, invite_code_id)
    if not invite_code:
        return None

    for key, value in update_data.items():
        setattr(invite_code, key, value)

    db.commit()
    db.refresh(invite_code)
    return invite_code


def delete_invite_code(db: Session, invite_code_id: str) -> bool:
    """Soft delete an invite code by ID."""
    invite_code = db.get(InviteCode, invite_code_id)
    if not invite_code:
        return False

    soft_delete(db, invite_code)
    db.commit()
    return True


def validate_and_use_invite_code(
    db: Session, code: str, user_id: str
) -> tuple[Optional[InviteCode], Optional[str]]:
    """
    Validate and use an invite code.

    Returns:
        tuple: (invite_code, error_message)
        If successful, error_message will be None
        If failed, invite_code will be None and error_message will contain the reason
    """
    invite_code = get_invite_code_by_code(db, code)

    if not invite_code:
        return None, "Invalid invite code"

    # Check if code is active
    if invite_code.status != InviteCodeStatus.ACTIVE:
        return None, f"Invite code is {invite_code.status}"

    # Check if code has expired
    if invite_code.expires_at:
        try:
            expires_at = datetime.fromisoformat(
                invite_code.expires_at.replace("Z", "+00:00")
            )
            if datetime.now(timezone.utc) > expires_at:
                # Mark as expired
                invite_code.status = InviteCodeStatus.EXPIRED
                db.commit()
                return None, "Invite code has expired"
        except ValueError:
            # Invalid date format, treat as expired
            invite_code.status = InviteCodeStatus.EXPIRED
            db.commit()
            return None, "Invite code has expired"

    if invite_code.used_count >= invite_code.max_uses:
        # Mark as used
        invite_code.status = InviteCodeStatus.USED
        db.commit()
        return None, "Invite code has been fully used"

    if user_id in [user.id for user in invite_code.used_by]:
        return None, "You have already used this invite code"

    invite_code.used_count += 1
    user = db.exec(select(User).where(User.id == user_id)).first()
    if user:
        invite_code.used_by.append(user)
    else:
        return None, "User not found"

    # Mark as used if max uses reached
    if invite_code.used_count >= invite_code.max_uses:
        invite_code.status = InviteCodeStatus.USED

    db.commit()
    db.refresh(invite_code)

    return invite_code, None


def auto_join_user_to_channel(db: Session, user_id: str, channel_id: str) -> bool:
    """Automatically join a user to a channel."""
    # Check if user is already a member
    existing_member = db.exec(
        select(ChannelMember).where(
            and_(
                ChannelMember.user_id == user_id, ChannelMember.channel_id == channel_id
            )
        )
    ).first()

    if existing_member:
        return True  # Already a member

    # Create new channel member
    channel_member = ChannelMember(user_id=user_id, channel_id=channel_id)

    db.add(channel_member)
    db.commit()
    return True


def get_invite_codes_by_channel(
    db: Session, channel_id: str, skip: int = 0, limit: int = 100
) -> List[InviteCode]:
    """Get all invite codes for a specific channel."""
    statement = (
        select(InviteCode)
        .where(InviteCode.auto_join_channel_id == channel_id, InviteCode.deleted_at.is_(None))
        .offset(skip)
        .limit(limit)
        .order_by(desc(inspect(InviteCode).columns.created_at))
    )

    return list(db.exec(statement).all())


def deactivate_invite_code(db: Session, invite_code_id: str) -> Optional[InviteCode]:
    """Deactivate an invite code (set status to EXPIRED)."""
    return update_invite_code(db, invite_code_id, {"status": InviteCodeStatus.EXPIRED})


def get_invite_code_usage_stats(db: Session, invite_code_id: str) -> dict:
    """Get usage statistics for an invite code."""
    invite_code = get_invite_code(db, invite_code_id)
    if not invite_code:
        return {}

    return {
        "code": invite_code.code,
        "max_uses": invite_code.max_uses,
        "used_count": invite_code.used_count,
        "remaining_uses": max(0, invite_code.max_uses - invite_code.used_count),
        "status": invite_code.status,
        "expires_at": invite_code.expires_at,
        "used_by_users": [
            {"id": user.id, "username": user.username, "email": user.email}
            for user in invite_code.used_by
        ],
    }
