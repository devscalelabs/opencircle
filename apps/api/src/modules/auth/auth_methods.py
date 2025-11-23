from datetime import datetime, timedelta, timezone
from typing import Optional, TypedDict

import jwt
from passlib.context import CryptContext
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from src.core.settings import settings
from src.database.models import InviteCodeStatus, User, UserSettings
from src.modules.auth.email_verification_methods import create_email_verification
from src.modules.auth.password_reset_methods import create_password_reset
from src.modules.email.email_service import email_service
from src.modules.invite_code.invite_code_methods import (
    auto_join_user_to_channel,
    get_invite_code_by_code,
    validate_and_use_invite_code,
)
from src.modules.user.user_methods import (
    create_user,
    get_user_by_username,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def register_user(
    db: Session,
    username: str,
    email: str,
    password: str,
    name: Optional[str] = None,
    invite_code: Optional[str] = None,
) -> User:
    """Register a new user."""
    existing_user = get_user_by_username(db, username)
    if existing_user:
        raise ValueError("Username already registered")

    # Pre-validate invite code if provided (without using it)
    if invite_code:
        invite_code_obj = get_invite_code_by_code(db, invite_code)
        if not invite_code_obj:
            raise ValueError("Invalid invite code")

        # Check if code is active
        if invite_code_obj.status != InviteCodeStatus.ACTIVE:
            raise ValueError(f"Invite code is {invite_code_obj.status}")

        # Check if code has expired
        if invite_code_obj.expires_at:
            try:
                expires_at = datetime.fromisoformat(
                    invite_code_obj.expires_at.replace("Z", "+00:00")
                )
                if datetime.now(timezone.utc) > expires_at:
                    raise ValueError("Invite code has expired")
            except ValueError:
                raise ValueError("Invite code has expired")

        # Check if code has reached max uses
        if invite_code_obj.used_count >= invite_code_obj.max_uses:
            raise ValueError("Invite code has been fully used")

    hashed_password = hash_password(password)

    user_data = {
        "username": username,
        "email": email,
        "password": hashed_password,
        "name": name,
        "is_active": False,
        "is_verified": False,
    }

    user = create_user(db, user_data)

    # Create user settings for the new user (with protection against race conditions)
    try:
        user_settings = UserSettings(user_id=user.id, is_onboarded=False)
        db.add(user_settings)
        db.commit()
    except IntegrityError:
        # Settings already exist (race condition or other error), rollback and continue
        db.rollback()

    # Send email verification
    email_verification = create_email_verification(db, email, user.id)
    if email_verification:
        verification_link = (
            f"{settings.PLATFORM_URL}/verify-email?code={email_verification.code}"
        )
        email_service.send_verification_email(
            to_email=email,
            verification_code=email_verification.code,
            verification_link=verification_link,
        )

    # Handle invite code usage and auto-join after user creation
    if invite_code:
        validated_invite_code, error_message = validate_and_use_invite_code(
            db, invite_code, user.id
        )
        if error_message:
            raise ValueError(f"Invalid invite code: {error_message}")

        if validated_invite_code and validated_invite_code.auto_join_channel_id:
            auto_join_user_to_channel(
                db, user.id, validated_invite_code.auto_join_channel_id
            )

    return user


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """Authenticate a user."""
    user = get_user_by_username(db, username)
    if not user or not user.password:
        return None
    if not verify_password(password, user.password):
        return None
    return user


class Token(TypedDict):
    access_token: str
    token_type: str


def login_user(db: Session, username: str, password: str) -> Optional[Token]:
    """Login a user and return access token."""
    user = authenticate_user(db, username, password)
    if not user:
        return None

    # Check if user is banned (is_active = False means banned)
    if not user.is_active:
        return None

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


def reset_password(db: Session, email: str) -> bool:
    """Send password reset email to user."""
    password_reset = create_password_reset(db, email)
    if not password_reset:
        # Don't reveal if email exists or not for security
        return True

    # Create reset link (you'll need to configure this URL)
    reset_link = (
        f"{settings.PLATFORM_URL}/reset-password-confirm?code={password_reset.code}"
    )

    # Send email
    email_sent = email_service.send_password_reset_email(
        to_email=email, reset_code=password_reset.code, reset_link=reset_link
    )

    return email_sent
