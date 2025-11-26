from typing import Optional

from sqlmodel import Session, col, func, select

from src.database.models import Role, User


def create_user(db: Session, user_data: dict) -> User:
    """Create a new user."""
    user = User(**user_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user(db: Session, user_id: str) -> Optional[User]:
    """Get a user by ID."""
    return db.get(User, user_id)


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by email."""
    statement = select(User).where(User.email == email)
    return db.exec(statement).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get a user by username."""
    statement = select(User).where(User.username == username)
    return db.exec(statement).first()


def update_user(db: Session, user_id: str, update_data: dict) -> Optional[User]:
    """Update a user by ID."""
    user = db.get(User, user_id)
    if not user:
        return None
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: str) -> bool:
    """Delete a user by ID and all related records."""
    from src.database.models import (
        Activity,
        ChannelMember,
        Course,
        EmailVerification,
        EnrolledCourse,
        Media,
        Notification,
        PasswordReset,
        Post,
        Reaction,
        Resource,
        UserPresence,
        UserSettings,
        UserSocial,
    )

    user = db.get(User, user_id)
    if not user:
        return False

    statement = select(UserPresence).where(UserPresence.user_id == user_id)
    for presence in db.exec(statement).all():
        db.delete(presence)

    statement = select(Activity).where(Activity.user_id == user_id)
    for activity in db.exec(statement).all():
        db.delete(activity)

    statement = select(Reaction).where(Reaction.user_id == user_id)
    for reaction in db.exec(statement).all():
        db.delete(reaction)

    statement = select(Notification).where(
        (Notification.sender_id == user_id) | (Notification.recipient_id == user_id)
    )
    for notification in db.exec(statement).all():
        db.delete(notification)

    statement = select(PasswordReset).where(PasswordReset.user_id == user_id)
    for password_reset in db.exec(statement).all():
        db.delete(password_reset)

    statement = select(EmailVerification).where(EmailVerification.user_id == user_id)
    for email_verification in db.exec(statement).all():
        db.delete(email_verification)

    statement = select(EnrolledCourse).where(EnrolledCourse.user_id == user_id)
    for enrolled_course in db.exec(statement).all():
        db.delete(enrolled_course)

    statement = select(Course).where(Course.instructor_id == user_id)
    for course in db.exec(statement).all():
        db.delete(course)

    statement = select(ChannelMember).where(ChannelMember.user_id == user_id)
    for channel_member in db.exec(statement).all():
        db.delete(channel_member)

    statement = select(Resource).where(Resource.user_id == user_id)
    for resource in db.exec(statement).all():
        db.delete(resource)

    statement = select(Media).where(Media.user_id == user_id)
    for media in db.exec(statement).all():
        db.delete(media)

    statement = select(Post).where(Post.user_id == user_id)
    for post in db.exec(statement).all():
        db.delete(post)

    statement = select(UserSettings).where(UserSettings.user_id == user_id)
    for user_settings in db.exec(statement).all():
        db.delete(user_settings)

    statement = select(UserSocial).where(UserSocial.user_id == user_id)
    for user_social in db.exec(statement).all():
        db.delete(user_social)

    db.delete(user)
    db.commit()
    return True


def get_all_users(
    db: Session, skip: int = 0, limit: int = 100, query: Optional[str] = None
) -> list[User]:
    """Get all users with pagination and optional query filtering."""
    statement = select(User)
    if query:
        statement = statement.where(col(User.username).ilike(f"%{query}%"))
    statement = statement.offset(skip).limit(limit)
    return list(db.exec(statement).all())


def ban_user(db: Session, user_id: str) -> Optional[User]:
    """Ban a user by setting is_active to False."""
    user = db.get(User, user_id)
    if not user:
        return None
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


def get_admin_count(db: Session) -> int:
    """Get the count of admin users."""
    statement = select(func.count(col(User.id))).where(col(User.role) == Role.ADMIN)
    return db.exec(statement).one()


def promote_user_to_admin(db: Session, user_id: str) -> Optional[User]:
    """Promote a user to admin role and activate them."""
    user = db.get(User, user_id)
    if not user:
        return None

    user.role = Role.ADMIN
    user.is_active = True  # Admin is active by default
    db.commit()
    db.refresh(user)
    return user
