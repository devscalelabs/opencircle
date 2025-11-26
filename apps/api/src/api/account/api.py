import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload
from sqlmodel import Session, select

from src.core.settings import settings
from src.database.engine import get_session as get_db
from src.database.models import Role, User, UserSettings, UserSocial
from src.modules.user.user_methods import get_user_by_username

from .serializer import UserResponse

router = APIRouter()
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Get current user from JWT token."""
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user_by_username(db, username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current user and verify they are an admin."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


@router.get("/account", response_model=UserResponse)
def get_account(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get current user account information."""
    # Load user with user_settings and user_social relationships
    statement = (
        select(User)
        .options(joinedload(User.user_settings), joinedload(User.user_social))
        .where(User.id == current_user.id)
    )
    user_with_data = db.exec(statement).first()

    if not user_with_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Create user settings if they don't exist (for existing users)
    if not user_with_data.user_settings:
        try:
            user_settings = UserSettings(user_id=user_with_data.id, is_onboarded=False)
            db.add(user_settings)
            db.commit()
        except IntegrityError:
            # Handle race condition - another request already created the settings
            db.rollback()
            # Re-load the user to get the newly created settings
            statement = (
                select(User)
                .options(joinedload(User.user_settings), joinedload(User.user_social))
                .where(User.id == current_user.id)
            )
            user_with_data = db.exec(statement).first()

            if not user_with_data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
                )

    # Create user social if they don't exist (for existing users)
    if not user_with_data.user_social:
        try:
            user_social = UserSocial(user_id=user_with_data.id)
            db.add(user_social)
            db.commit()
        except IntegrityError:
            # Handle race condition - another request already created the social data
            db.rollback()
            # Re-load the user to get the newly created social data
            statement = (
                select(User)
                .options(joinedload(User.user_settings), joinedload(User.user_social))
                .where(User.id == current_user.id)
            )
            user_with_data = db.exec(statement).first()

            if not user_with_data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
                )

    # Refresh to get the newly created relationships
    db.refresh(user_with_data)

    return UserResponse.model_validate(user_with_data)
