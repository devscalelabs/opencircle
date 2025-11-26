import secrets
from typing import Optional, TypedDict

from httpx_oauth.clients.github import GitHubOAuth2
from httpx_oauth.oauth2 import OAuth2Token
from loguru import logger
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from src.core.settings import settings
from src.database.models import User, UserSettings
from src.modules.user.user_methods import create_user, get_user_by_email

# Initialize GitHub OAuth client
github_client = GitHubOAuth2(
    client_id=settings.GITHUB_CLIENT_ID,
    client_secret=settings.GITHUB_CLIENT_SECRET,
)


class GitHubUserInfo(TypedDict):
    """GitHub user information from OAuth."""

    id: int
    login: str
    email: str
    name: Optional[str]
    avatar_url: Optional[str]


def generate_state_token() -> str:
    """Generate a secure random state token for OAuth flow."""
    return secrets.token_urlsafe(32)


async def get_github_authorization_url(state: str) -> str:
    """Get GitHub authorization URL for OAuth flow."""
    authorization_url = await github_client.get_authorization_url(
        redirect_uri=settings.GITHUB_REDIRECT_URI,
        state=state,
        scope=["user:email"],
    )
    return authorization_url


async def get_github_user_info(access_token: str) -> GitHubUserInfo:
    """Get user information from GitHub using access token."""
    async with github_client.get_httpx_client() as client:
        response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        response.raise_for_status()
        user_data = response.json()

        # Get user email if not provided in main profile
        if not user_data.get("email"):
            email_response = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            email_response.raise_for_status()
            emails = email_response.json()
            # Find primary email
            for email_data in emails:
                if email_data.get("primary"):
                    user_data["email"] = email_data["email"]
                    break

        return GitHubUserInfo(
            id=user_data["id"],
            login=user_data["login"],
            email=user_data["email"],
            name=user_data.get("name"),
            avatar_url=user_data.get("avatar_url"),
        )


def create_user_from_github(db: Session, github_user: GitHubUserInfo) -> User:
    """Create a new user from GitHub OAuth data."""
    # Check if registration is enabled
    from src.modules.appsettings import appsettings_methods

    app_settings = appsettings_methods.get_active_app_settings(db)
    if app_settings and not app_settings.enable_sign_up:
        raise ValueError(
            "Registration is currently disabled. Please contact the administrator."
        )

    # Generate a unique username based on GitHub login
    base_username = github_user["login"].lower()
    username = base_username

    # Check if username already exists and make it unique if needed
    counter = 1
    while get_user_by_email(db, github_user["email"]):
        # If email already exists, we'll handle it in the login function
        break

    # Check if username exists
    from src.modules.user.user_methods import get_user_by_username

    while get_user_by_username(db, username):
        username = f"{base_username}{counter}"
        counter += 1

    user_data = {
        "username": username,
        "email": github_user["email"],
        "name": github_user.get("name"),
        "avatar_url": github_user.get("avatar_url"),
        "is_active": True,
        "is_verified": True,  # GitHub email is verified
        "password": None,  # No password for OAuth users
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

    return user


def authenticate_github_user(
    db: Session, github_user: GitHubUserInfo
) -> Optional[User]:
    """Authenticate or create user from GitHub OAuth data."""
    # First, try to find user by email
    user = get_user_by_email(db, github_user["email"])

    if user:
        # Check if user is banned (is_active = False means banned)
        if not user.is_active:
            return None

        # Update user info from GitHub if needed
        update_data = {}
        if (
            github_user.get("avatar_url")
            and user.avatar_url != github_user["avatar_url"]
        ):
            update_data["avatar_url"] = github_user["avatar_url"]
        if github_user.get("name") and user.name != github_user["name"]:
            update_data["name"] = github_user["name"]

        if update_data:
            from src.modules.user.user_methods import update_user

            user = update_user(db, user.id, update_data)
    else:
        # Create new user
        user = create_user_from_github(db, github_user)

    return user


async def handle_github_callback(
    db: Session, code: str
) -> tuple[Optional[User], OAuth2Token]:
    """Handle GitHub OAuth callback and return user and token."""
    # Exchange code for access token
    token = await github_client.get_access_token(code, settings.GITHUB_REDIRECT_URI)

    # Handle different token structures
    access_token = None
    if isinstance(token, dict):
        # Check if GitHub returned an error
        if "error" in token:
            error_msg = token.get(
                "error_description", token.get("error", "Unknown error")
            )
            logger.error(f"GitHub OAuth error: {error_msg}")
            raise ValueError(f"GitHub OAuth error: {error_msg}")

        access_token = (
            token.get("access_token") or token.get("access token") or token.get("token")
        )
    else:
        # Try to access as object attribute
        access_token = getattr(token, "access_token", None)

    if not access_token:
        logger.error(f"Could not extract access token from token: {token}")
        raise ValueError("Could not extract access token from GitHub response")

    # Get user info from GitHub
    github_user = await get_github_user_info(access_token)

    # Authenticate or create user
    user = authenticate_github_user(db, github_user)
    if not user:
        raise ValueError("Failed to authenticate GitHub user")

    return user, token
