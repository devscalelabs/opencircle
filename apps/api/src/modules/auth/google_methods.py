"""
Google OAuth authentication methods.
"""

import logging
import secrets
from typing import Optional, TypedDict

from httpx_oauth.clients.google import GoogleOAuth2
from httpx_oauth.oauth2 import OAuth2Token
from sqlmodel import Session

from src.core.settings import settings
from src.database.models import User, UserSettings
from src.modules.user.user_methods import create_user, get_user_by_email

logger = logging.getLogger(__name__)

# Initialize Google OAuth client
google_client = GoogleOAuth2(
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
)


class GoogleUserInfo(TypedDict):
    """Google user information from OAuth."""

    id: str
    email: str
    name: Optional[str]
    picture: Optional[str]


def generate_state_token() -> str:
    """Generate a secure random state token for OAuth flow."""
    return secrets.token_urlsafe(32)


async def get_google_authorization_url(state: str) -> str:
    """Get Google authorization URL for OAuth flow."""
    authorization_url = await google_client.get_authorization_url(
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
        state=state,
        scope=["openid", "email", "profile"],
    )
    return authorization_url


async def get_google_user_info(access_token: str) -> GoogleUserInfo:
    """Get user information from Google using access token."""
    async with google_client.get_httpx_client() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v1/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        response.raise_for_status()
        user_data = response.json()

        return GoogleUserInfo(
            id=user_data["id"],
            email=user_data["email"],
            name=user_data.get("name"),
            picture=user_data.get("picture"),
        )


def create_user_from_google(db: Session, google_user: GoogleUserInfo) -> User:
    """Create a new user from Google OAuth data."""
    # Check if registration is enabled
    from src.modules.appsettings import appsettings_methods

    app_settings = appsettings_methods.get_active_app_settings(db)
    if app_settings and not app_settings.enable_sign_up:
        raise ValueError(
            "Registration is currently disabled. Please contact the administrator."
        )

    # Generate a unique username based on Google email
    base_username = google_user["email"].split("@")[0].lower()
    username = base_username

    # Check if username exists
    from src.modules.user.user_methods import get_user_by_username

    counter = 1
    while get_user_by_username(db, username):
        username = f"{base_username}{counter}"
        counter += 1

    user_data = {
        "username": username,
        "email": google_user["email"],
        "name": google_user.get("name"),
        "avatar_url": google_user.get("picture"),
        "is_active": True,
        "is_verified": True,  # Google email is verified
        "password": None,  # No password for OAuth users
    }

    user = create_user(db, user_data)

    # Create user settings for the new user
    user_settings = UserSettings(user_id=user.id, is_onboarded=False)
    db.add(user_settings)
    db.commit()

    return user


def authenticate_google_user(
    db: Session, google_user: GoogleUserInfo
) -> Optional[User]:
    """Authenticate or create user from Google OAuth data."""
    # First, try to find user by email
    user = get_user_by_email(db, google_user["email"])

    if user:
        # Check if user is banned (is_active = False means banned)
        if not user.is_active:
            return None

        # Update user info from Google if needed
        update_data = {}
        if google_user.get("picture") and user.avatar_url != google_user["picture"]:
            update_data["avatar_url"] = google_user["picture"]
        if google_user.get("name") and user.name != google_user["name"]:
            update_data["name"] = google_user["name"]

        if update_data:
            from src.modules.user.user_methods import update_user

            user = update_user(db, user.id, update_data)
    else:
        # Create new user
        user = create_user_from_google(db, google_user)

    return user


async def handle_google_callback(
    db: Session, code: str
) -> tuple[Optional[User], OAuth2Token]:
    """Handle Google OAuth callback and return user and token."""
    # Exchange code for access token
    token = await google_client.get_access_token(code, settings.GOOGLE_REDIRECT_URI)

    # Handle different token structures
    access_token = None
    if isinstance(token, dict):
        # Check if Google returned an error
        if "error" in token:
            error_msg = token.get(
                "error_description", token.get("error", "Unknown error")
            )
            logger.error(f"Google OAuth error: {error_msg}")
            raise ValueError(f"Google OAuth error: {error_msg}")

        access_token = (
            token.get("access_token") or token.get("access token") or token.get("token")
        )
    else:
        # Try to access as object attribute
        access_token = getattr(token, "access_token", None)

    if not access_token:
        logger.error(f"Could not extract access token from token: {token}")
        raise ValueError("Could not extract access token from Google response")

    # Get user info from Google
    google_user = await get_google_user_info(access_token)

    # Authenticate or create user
    user = authenticate_google_user(db, google_user)
    if not user:
        raise ValueError("Failed to authenticate Google user")

    return user, token
