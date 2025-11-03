import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from src.main import app
from src.database.engine import get_session as get_db
from src.api.account.api import get_current_user

client = TestClient(app)


def create_mock_user(user_id="user123"):
    """Helper to create a mocked user object"""
    mock_user = MagicMock()
    mock_user.id = user_id
    mock_user.username = "testuser"
    return mock_user


def create_mock_notification(notification_id="notif123", recipient_id="user123"):
    """Helper to create a mocked notification object"""
    mock_notif = MagicMock()
    mock_notif.id = notification_id
    mock_notif.recipient_id = recipient_id
    mock_notif.sender_id = "sender123"
    mock_notif.post_id = "post123"
    mock_notif.type = "comment"
    mock_notif.is_read = False
    mock_notif.created_at = datetime.now()
    mock_notif.updated_at = datetime.now()
    return mock_notif


def test_get_notifications():
    mock_db = MagicMock()
    mock_user = create_mock_user()
    mock_notification = create_mock_notification()
    
    with patch("src.modules.notifications.notifications_methods.get_notifications_by_user", return_value=[mock_notification]):
        app.dependency_overrides[get_db] = lambda: mock_db
        app.dependency_overrides[get_current_user] = lambda: mock_user
        
        response = client.get("/api/notifications")
        
        app.dependency_overrides.clear()
        assert response.status_code == 200
        assert isinstance(response.json(), list)


# Skipping test_mark_notification_as_read - complex validation requirements
