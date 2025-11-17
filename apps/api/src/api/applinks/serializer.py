from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AppLinkCreate(BaseModel):
    label: str
    url: str


class AppLinkUpdate(BaseModel):
    label: Optional[str] = None
    url: Optional[str] = None


class AppLinkResponse(BaseModel):
    id: str
    label: str
    url: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
