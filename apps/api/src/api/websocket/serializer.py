from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class WebSocketMessage(BaseModel):
    """Base WebSocket message structure"""

    type: str
    data: dict


class PresenceEvent(BaseModel):
    """User presence event"""

    event_type: Literal["connect", "disconnect", "heartbeat"]
    user_id: str
    timestamp: datetime
    metadata: dict | None = None


class SubscriptionRequest(BaseModel):
    """Subscription request from client"""

    action: Literal["subscribe", "unsubscribe"]
    subscription_type: Literal["user", "event"]
    target_id: str  # user_id or event_id
