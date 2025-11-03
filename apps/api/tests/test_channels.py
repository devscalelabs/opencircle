import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from src.main import app
from src.database.engine import get_session as get_db
from src.database.models import Channel, User
from src.api.account.api import get_current_user

client = TestClient(app)


def create_mock_user(user_id="user123", username="testuser", role="admin"):
    """Helper to create a mocked user object"""
    mock_user = MagicMock(spec=User)
    mock_user.id = user_id
    mock_user.username = username
    mock_user.role = role
    return mock_user


def create_mock_channel(channel_id="channel123", name="Test Channel", slug="test-channel", channel_type="public"):
    """Helper to create a properly mocked channel object"""
    mock_channel = MagicMock(spec=Channel)
    mock_channel.id = channel_id
    mock_channel.name = name
    mock_channel.emoji = "😊"
    mock_channel.slug = slug
    mock_channel.type = channel_type
    mock_channel.description = "Test description"
    mock_channel.created_at = datetime.now()
    mock_channel.updated_at = datetime.now()
    return mock_channel


def test_create_channel():
    mock_db = MagicMock()
    mock_user = create_mock_user()
    mock_channel = create_mock_channel()
    
    with patch("src.api.channels.api.create_channel", return_value=mock_channel):
        app.dependency_overrides[get_db] = lambda: mock_db
        app.dependency_overrides[get_current_user] = lambda: mock_user
        
        response = client.post("/api/channels/", json={
            "name": "Test Channel",
            "slug": "test-channel",
            "type": "public"
        })
        
        app.dependency_overrides.clear()
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Channel"


def test_get_channel():
    mock_db = MagicMock()
    mock_channel = create_mock_channel()
    
    with patch("src.api.channels.api.get_channel", return_value=mock_channel):
        app.dependency_overrides[get_db] = lambda: mock_db
        
        response = client.get("/api/channels/channel123")
        
        app.dependency_overrides.clear()
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Channel"


def test_get_all_channels():
    mock_db = MagicMock()
    mock_channel = create_mock_channel()
    
    with patch("src.api.channels.api.get_all_channels", return_value=[mock_channel]):
        app.dependency_overrides[get_db] = lambda: mock_db
        
        response = client.get("/api/channels/")
        
        app.dependency_overrides.clear()
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert data[0]["name"] == "Test Channel"


def test_update_channel():
    mock_db = MagicMock()
    mock_user = create_mock_user()
    mock_channel = create_mock_channel(name="Updated Channel")
    
    with patch("src.api.channels.api.get_channel", return_value=mock_channel):
        with patch("src.api.channels.api.update_channel", return_value=mock_channel):
            app.dependency_overrides[get_db] = lambda: mock_db
            app.dependency_overrides[get_current_user] = lambda: mock_user
            
            response = client.put("/api/channels/channel123", json={"name": "Updated Channel"})
            
            app.dependency_overrides.clear()
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "Updated Channel"


def test_delete_channel():
    mock_db = MagicMock()
    mock_user = create_mock_user()
    mock_channel = create_mock_channel()
    
    with patch("src.api.channels.api.get_channel", return_value=mock_channel):
        with patch("src.api.channels.api.delete_channel", return_value=True):
            app.dependency_overrides[get_db] = lambda: mock_db
            app.dependency_overrides[get_current_user] = lambda: mock_user
            
            response = client.delete("/api/channels/channel123")
            
            app.dependency_overrides.clear()
            assert response.status_code == 200
            assert "message" in response.json()
