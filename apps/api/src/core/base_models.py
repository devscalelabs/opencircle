from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, event
from sqlmodel import Field, SQLModel

from src.core.common import generate_id


class BaseModel(SQLModel):
    id: str = Field(default_factory=generate_id, primary_key=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
    )
    deleted_at: Optional[datetime] = Field(
        default=None,
        sa_type=DateTime(timezone=True),
        description="Timestamp when the record was soft deleted. Null if not deleted."
    )


# Auto-update updated_at on model updates
@event.listens_for(BaseModel, "before_update")
def update_updated_at(mapper, connection, target):
    target.updated_at = datetime.now(timezone.utc)
