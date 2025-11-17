import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scalar_fastapi import get_scalar_api_reference

from src.api.account.api import router as account_router
from src.api.applinks.api import router as applinks_router
from src.api.appsettings.api import router as appsettings_router
from src.api.article.api import router as article_router
from src.api.auth.api import router as auth_router
from src.api.channel_members.api import router as channel_members_router
from src.api.channels.api import router as channels_router
from src.api.courses.api import router as courses_router
from src.api.extras.api import router as extras_router
from src.api.invite_code.api import router as invite_code_router
from src.api.media.api import router as media_router
from src.api.notifications.api import router as notifications_router
from src.api.post.api import router as post_router
from src.api.presence.api import router as presence_router
from src.api.reaction.api import router as reaction_router
from src.api.resources.api import router as resources_router
from src.api.user.api import router as user_router
from src.api.websocket.api import router as websocket_router
from src.database.engine import get_session
from src.modules.appsettings import appsettings_methods


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle with AppSettings initialization."""
    logger.info("Initializing AppSettings...")
    try:
        session = next(get_session())
        appsettings_methods.get_or_create_app_settings(
            session,
            {
                "app_name": "OpenCircle",
                "app_logo_url": None,
                "enable_sign_up": True,
            },
        )
        logger.info("AppSettings initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize AppSettings: {e}")
        logger.warning("Continuing startup without AppSettings initialization")
    finally:
        if "session" in locals():
            session.close()

    yield

    # Shutdown: Cleanup if needed
    logger.info("Application shutting down...")


app = FastAPI(lifespan=lifespan)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


app.add_middleware(
    CORSMiddleware,  # type: ignore
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(account_router, prefix="/api", tags=["account"])
app.include_router(user_router, prefix="/api", tags=["users"])
app.include_router(media_router, prefix="/api", tags=["medias"])
app.include_router(post_router, prefix="/api", tags=["posts"])
app.include_router(channels_router, prefix="/api", tags=["channels"])
app.include_router(channel_members_router, prefix="/api", tags=["channel-members"])
app.include_router(courses_router, prefix="/api", tags=["courses"])
app.include_router(auth_router, prefix="/api", tags=["auth"])
app.include_router(reaction_router, prefix="/api", tags=["reactions"])
app.include_router(article_router, prefix="/api", tags=["articles"])
app.include_router(extras_router, prefix="/api", tags=["extras"])
app.include_router(invite_code_router, prefix="/api", tags=["invite-codes"])
app.include_router(notifications_router, prefix="/api", tags=["notifications"])
app.include_router(resources_router, prefix="/api", tags=["resources"])
app.include_router(applinks_router, prefix="/api", tags=["applinks"])
app.include_router(appsettings_router, prefix="/api/appsettings", tags=["appsettings"])
app.include_router(websocket_router, prefix="/api", tags=["websocket"])
app.include_router(presence_router, prefix="/api/presence", tags=["presence"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api"}


@app.get("/scalar", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
    )
