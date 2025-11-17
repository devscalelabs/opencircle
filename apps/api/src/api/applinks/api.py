from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from src.api.account.api import get_current_user
from src.database.engine import get_session as get_db
from src.database.models import User

from .serializer import AppLinkCreate, AppLinkResponse, AppLinkUpdate

router = APIRouter()


@router.post("/applinks/", response_model=AppLinkResponse)
def create_app_link_endpoint(
    app_link: AppLinkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new app link (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    from src.modules.applinks.applinks_methods import create_app_link

    app_link_data = app_link.model_dump()
    created_app_link = create_app_link(db, app_link_data)
    return created_app_link


@router.get("/applinks/", response_model=List[AppLinkResponse])
def get_all_app_links_endpoint(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Get all app links (public endpoint)."""
    from src.modules.applinks.applinks_methods import get_all_app_links

    app_links = get_all_app_links(db, skip=skip, limit=limit)
    return app_links


@router.get("/applinks/{app_link_id}", response_model=AppLinkResponse)
def get_app_link_endpoint(
    app_link_id: str,
    db: Session = Depends(get_db),
):
    """Get a specific app link (public endpoint)."""
    from src.modules.applinks.applinks_methods import get_app_link

    app_link = get_app_link(db, app_link_id)
    if not app_link:
        raise HTTPException(status_code=404, detail="App link not found")
    return app_link


@router.put("/applinks/{app_link_id}", response_model=AppLinkResponse)
def update_app_link_endpoint(
    app_link_id: str,
    app_link: AppLinkUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an app link (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    from src.modules.applinks.applinks_methods import get_app_link, update_app_link

    existing_app_link = get_app_link(db, app_link_id)
    if not existing_app_link:
        raise HTTPException(status_code=404, detail="App link not found")

    update_data = {k: v for k, v in app_link.model_dump().items() if v is not None}
    updated_app_link = update_app_link(db, app_link_id, update_data)
    if not updated_app_link:
        raise HTTPException(status_code=404, detail="App link not found")
    return updated_app_link


@router.delete("/applinks/{app_link_id}")
def delete_app_link_endpoint(
    app_link_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an app link (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    from src.modules.applinks.applinks_methods import delete_app_link, get_app_link

    existing_app_link = get_app_link(db, app_link_id)
    if not existing_app_link:
        raise HTTPException(status_code=404, detail="App link not found")

    if not delete_app_link(db, app_link_id):
        raise HTTPException(status_code=404, detail="App link not found")
    return {"message": "App link deleted"}
