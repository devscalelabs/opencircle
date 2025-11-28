from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from src.api.channels.serializer import ChannelResponse
from src.api.user.serializer import UserResponse


class BroadcastCreate(BaseModel):
    subject: str
    content: str
    recipient_type: str = "test_email"
    test_email: Optional[str] = None
    channel_id: Optional[str] = None


class BroadcastUpdate(BaseModel):
    subject: Optional[str] = None
    content: Optional[str] = None
    recipient_type: Optional[str] = None
    test_email: Optional[str] = None
    channel_id: Optional[str] = None


class BroadcastSendTest(BaseModel):
    test_email: str


class BroadcastResponse(BaseModel):
    id: str
    subject: str
    content: str
    recipient_type: str
    test_email: Optional[str] = None
    channel_id: Optional[str] = None
    channel: Optional[ChannelResponse] = None
    status: str
    sent_at: Optional[str] = None
    sent_count: int = 0
    failed_count: int = 0
    created_by: str
    creator: Optional[UserResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
