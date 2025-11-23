import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlmodel import Session, select

from src.database.models import EmailVerification, EmailVerificationStatus


def generate_verification_code() -> str:
    """Generate a 6-letter uppercase verification code."""
    return "".join(secrets.choice(string.ascii_uppercase) for _ in range(6))


def create_email_verification(
    db: Session, email: str, user_id: str
) -> Optional[EmailVerification]:
    """Create a new email verification record for the user."""
    # Deactivate any existing verification codes for this email
    existing_verifications = db.exec(
        select(EmailVerification)
        .where(EmailVerification.email == email)
        .where(EmailVerification.status == EmailVerificationStatus.ACTIVE)
    ).all()

    for verification in existing_verifications:
        verification.status = EmailVerificationStatus.EXPIRED

    # Generate new verification code
    code = generate_verification_code()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)  # 24 hour expiration

    email_verification = EmailVerification(
        code=code,
        email=email,
        user_id=user_id,
        expires_at=expires_at.isoformat(),
        status=EmailVerificationStatus.ACTIVE,
    )

    db.add(email_verification)
    db.commit()
    db.refresh(email_verification)

    return email_verification


def get_email_verification_by_code(
    db: Session, code: str
) -> Optional[EmailVerification]:
    """Get an email verification record by code."""
    statement = select(EmailVerification).where(EmailVerification.code == code)
    return db.exec(statement).first()


def is_verification_code_valid(db: Session, code: str) -> bool:
    """Check if a verification code is valid (active and not expired)."""
    verification = get_email_verification_by_code(db, code)
    if not verification:
        return False

    if verification.status != EmailVerificationStatus.ACTIVE:
        return False

    # Check expiration
    try:
        expires_at = datetime.fromisoformat(
            verification.expires_at.replace("Z", "+00:00")
        )
        if datetime.now(timezone.utc) > expires_at:
            # Mark as expired
            verification.status = EmailVerificationStatus.EXPIRED
            db.commit()
            return False
    except ValueError:
        return False

    return True


def use_verification_code(db: Session, code: str) -> Optional[EmailVerification]:
    """Mark a verification code as used and return it."""
    verification = get_email_verification_by_code(db, code)
    if not verification or not is_verification_code_valid(db, code):
        return None

    verification.status = EmailVerificationStatus.USED
    db.commit()
    return verification


def verify_user_email(db: Session, code: str) -> bool:
    """Verify user email using a valid verification code."""
    verification = use_verification_code(db, code)
    if not verification:
        return False

    # Update user verification status
    from src.modules.user.user_methods import update_user

    updated_user = update_user(
        db, verification.user_id, {"is_verified": True, "is_active": True}
    )

    return updated_user is not None
