from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from src.database.engine import get_session as get_db
from src.database.models import UrlPreview
from src.modules.extras.extras_methods import fetch_url_metadata

from .serializer import UrlPreviewResponse

router = APIRouter()


@router.get("/url-preview", response_model=UrlPreviewResponse)
def get_url_preview(
    url: str = Query(..., description="URL to preview"), db: Session = Depends(get_db)
):
    # Check if already cached
    preview = db.exec(
        select(UrlPreview).where(UrlPreview.url == url, UrlPreview.deleted_at.is_(None))
    ).first()
    if preview:
        return UrlPreviewResponse(
            url=preview.url,
            title=preview.title,
            description=preview.description,
            image_url=preview.image_url,
            created_at=preview.created_at,
        )

    # Fetch new metadata
    metadata = fetch_url_metadata(url)

    # Save to DB
    new_preview = UrlPreview(
        url=url,
        title=metadata["title"],
        description=metadata["description"],
        image_url=metadata["image_url"],
    )
    db.add(new_preview)
    db.commit()
    db.refresh(new_preview)

    return UrlPreviewResponse(
        url=new_preview.url,
        title=new_preview.title,
        description=new_preview.description,
        image_url=new_preview.image_url,
        created_at=new_preview.created_at,
    )
