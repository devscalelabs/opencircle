import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from src.main import app
from src.database.engine import get_session as get_db
from src.api.account.api import get_current_user

client = TestClient(app)


def create_mock_user(user_id="user123", username="testuser"):
    """Helper to create a mocked user object"""
    mock_user = MagicMock()
    mock_user.id = user_id
    mock_user.username = username
    mock_user.name = "Test User"
    mock_user.bio = "Test bio"
    mock_user.email = "test@example.com"
    mock_user.avatar_url = "https://example.com/avatar.jpg"
    mock_user.role = "user"
    
    mock_social = MagicMock()
    mock_social.twitter_url = ""
    mock_social.linkedin_url = ""
    mock_social.github_url = ""
    mock_social.website_url = ""
    mock_user.user_social = mock_social
    
    mock_settings = MagicMock()
    mock_settings.is_onboarded = False
    mock_user.user_settings = mock_settings
    
    return mock_user


def test_get_account():
    mock_db = MagicMock()
    mock_user = create_mock_user()
    
    mock_query = mock_db.query.return_value
    mock_query.options.return_value.filter.return_value.first.return_value = mock_user
    
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    response = client.get("/api/account")
    
    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json()["id"] == "user123"
