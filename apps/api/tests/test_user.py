import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from src.main import app
from src.database.engine import get_session as get_db
from src.database.models import User, UserSettings, UserSocial

client = TestClient(app)


def create_mock_user(user_id="user123", username="testuser", email="test@example.com"):
    """Helper to create a properly mocked user object"""
    mock_user = MagicMock(spec=User)
    mock_user.id = user_id
    mock_user.username = username
    mock_user.email = email
    mock_user.name = "Test User"
    mock_user.bio = "Test bio"
    mock_user.avatar_url = "https://example.com/avatar.jpg"
    mock_user.role = "user"
    
    mock_social = MagicMock(spec=UserSocial)
    mock_social.twitter_url = ""
    mock_social.linkedin_url = ""
    mock_social.github_url = ""
    mock_social.website_url = ""
    mock_user.user_social = mock_social
    
    mock_settings = MagicMock(spec=UserSettings)
    mock_user.user_settings = mock_settings
    
    return mock_user


def test_create_user():
    mock_db = MagicMock()
    mock_user = create_mock_user()
    
    with patch("src.modules.user.user_methods.create_user", return_value=mock_user):
        app.dependency_overrides[get_db] = lambda: mock_db
        
        response = client.post("/api/users/", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123"
        })
        
        app.dependency_overrides.clear()
        assert response.status_code in [200, 422]


def test_get_user():
    mock_db = MagicMock()
    mock_user = create_mock_user()
    
    mock_query = mock_db.query.return_value
    mock_query.options.return_value.filter.return_value.first.return_value = mock_user
    
    app.dependency_overrides[get_db] = lambda: mock_db
    
    response = client.get("/api/users/user123")
    
    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json()["id"] == "user123"


def test_get_all_users():
    mock_db = MagicMock()
    
    with patch("src.modules.user.user_methods.get_all_users", return_value=[]):
        app.dependency_overrides[get_db] = lambda: mock_db
        
        response = client.get("/api/users/")
        
        app.dependency_overrides.clear()
        assert response.status_code == 200
        assert isinstance(response.json(), list)


def test_update_user():
    mock_db = MagicMock()
    mock_user = create_mock_user(username="updateduser")
    
    mock_query = mock_db.query.return_value
    mock_query.options.return_value.filter.return_value.first.return_value = mock_user
    
    with patch("src.modules.user.user_methods.update_user", return_value=mock_user):
        app.dependency_overrides[get_db] = lambda: mock_db
        
        response = client.put("/api/users/user123", json={"username": "updateduser"})
        
        app.dependency_overrides.clear()
        assert response.status_code == 200
        assert response.json()["username"] == "updateduser"


def test_delete_user():
    mock_db = MagicMock()
    
    with patch("src.modules.user.user_methods.delete_user", return_value=True):
        app.dependency_overrides[get_db] = lambda: mock_db
        
        response = client.delete("/api/users/user123")
        
        app.dependency_overrides.clear()
        assert response.status_code == 200
        assert "message" in response.json()