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
    mock_user.name = "Test User"
    mock_user.bio = "Test bio"
    mock_user.email = "test@example.com"
    mock_user.is_active = True
    mock_user.is_verified = True
    mock_user.avatar_url = "https://example.com/avatar.jpg"
    mock_user.role = "user"
    mock_user.created_at = datetime.now()
    mock_user.updated_at = datetime.now()
    
    mock_social = MagicMock()
    mock_social.twitter_url = ""
    mock_social.linkedin_url = ""
    mock_social.github_url = ""
    mock_social.website_url = ""
    mock_user.user_social = mock_social
    
    mock_settings = MagicMock()
    mock_settings.is_onboarded = True
    mock_user.user_settings = mock_settings
    
    return mock_user


def create_mock_reaction(reaction_id="reaction123", user_id="user123", post_id="post123", emoji="👍"):
    """Helper to create a mocked reaction object"""
    mock_reaction = MagicMock()
    mock_reaction.id = reaction_id
    mock_reaction.user_id = user_id
    mock_reaction.post_id = post_id
    mock_reaction.emoji = emoji
    mock_reaction.created_at = datetime.now()
    mock_reaction.updated_at = datetime.now()
    mock_reaction.user = create_mock_user(user_id)
    return mock_reaction


def test_create_reaction():
    mock_db = MagicMock()
    mock_user = create_mock_user()
    mock_reaction = create_mock_reaction()
    mock_post = MagicMock()
    mock_post.id = "post123"
    mock_post.user_id = "post_owner_id"
    
    with patch("src.api.reaction.api.create_reaction", return_value=mock_reaction), \
         patch("src.api.reaction.api.get_post", return_value=mock_post), \
         patch("src.api.reaction.api.create_notification_task") as mock_notify:
        app.dependency_overrides[get_db] = lambda: mock_db
        app.dependency_overrides[get_current_user] = lambda: mock_user
        
        response = client.post("/api/reactions/", json={
            "post_id": "post123",
            "emoji": "👍"
        })
        
        app.dependency_overrides.clear()
        assert response.status_code == 200
        mock_notify.delay.assert_called_once()


def test_delete_reaction():
    mock_db = MagicMock()
    mock_user = create_mock_user()
    
    with patch("src.modules.reaction.reaction_methods.delete_reaction", return_value=True):
        app.dependency_overrides[get_db] = lambda: mock_db
        app.dependency_overrides[get_current_user] = lambda: mock_user
        
        response = client.delete("/api/reactions/", params={"post_id": "post123", "emoji": "👍"})
        
        app.dependency_overrides.clear()
        assert response.status_code == 200
        assert "message" in response.json()
