from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from src.core.settings import settings
from src.database.engine import get_session as get_db
from src.modules.auth.auth_methods import create_access_token, login_user, register_user
from src.modules.auth.github_methods import (
    generate_state_token,
    get_github_authorization_url,
    handle_github_callback,
)

from .serializer import (
    GitHubAuthUrlResponse,
    GitHubLoginRequest,
    GitHubLoginResponse,
    LoginRequest,
    RegisterRequest,
)

router = APIRouter()


@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user = register_user(
            db,
            request.username,
            request.email,
            request.password,
            request.name,
            request.invite_code,
        )
        return {"message": "User registered successfully", "user_id": user.id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IntegrityError as e:
        db.rollback()
        error_msg = str(e.orig)
        if "email" in error_msg.lower():
            raise HTTPException(status_code=409, detail="Email already registered")
        elif "username" in error_msg.lower():
            raise HTTPException(status_code=409, detail="Username already registered")
        raise HTTPException(
            status_code=409, detail="Registration failed: duplicate entry"
        )


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    result = login_user(db, request.username, request.password)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return result


@router.get("/github/login", response_model=GitHubAuthUrlResponse)
async def github_login():
    """Get GitHub authorization URL for OAuth login."""
    state = generate_state_token()
    authorization_url = await get_github_authorization_url(state)
    return GitHubAuthUrlResponse(
        authorization_url=authorization_url,
        state=state,
    )


@router.post("/github/callback", response_model=GitHubLoginResponse)
async def github_callback(
    request: GitHubLoginRequest,
    db: Session = Depends(get_db),
):
    """Handle GitHub OAuth callback and complete login."""
    try:
        # Debug logging
        import logging

        logger = logging.getLogger(__name__)
        logger.info(f"GitHub callback received with code: {request.code[:10]}...")

        # Check GitHub OAuth configuration
        if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
            logger.error("GitHub OAuth credentials not configured")
            raise HTTPException(
                status_code=500,
                detail="GitHub OAuth not properly configured",
            )

        # Handle GitHub OAuth callback
        user, token = await handle_github_callback(db, request.code)
        if not user:
            raise HTTPException(
                status_code=400,
                detail="GitHub authentication failed: Unable to create or find user",
            )

        from datetime import timedelta

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )

        return GitHubLoginResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=user.id,
            username=user.username,
            email=user.email,
            name=user.name,
            avatar_url=user.avatar_url,
        )
    except Exception as e:
        import logging

        logger = logging.getLogger(__name__)
        logger.error(f"GitHub OAuth callback failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=400, detail=f"GitHub authentication failed: {str(e)}"
        )
