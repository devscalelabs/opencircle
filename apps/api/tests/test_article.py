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
    mock_user.avatar_url = "https://example.com/avatar.jpg"
    mock_user.role = "user"
    
    mock_social = MagicMock()
    mock_social.twitter_url = ""
    mock_social.linkedin_url = ""
    mock_social.github_url = ""
    mock_social.website_url = ""
    mock_user.user_social = mock_social
    
    mock_settings = MagicMock()
    mock_user.user_settings = mock_settings
    
    return mock_user


def create_mock_article(article_id="article123", title="Test Article", user_id="user123"):
    """Helper to create a mocked article object"""
    mock_article = MagicMock()
    mock_article.id = article_id
    mock_article.title = title
    mock_article.content = "Test content"
    mock_article.type = "article"
    mock_article.user_id = user_id
    mock_article.channel_id = None
    mock_article.parent_id = None
    mock_article.created_at = datetime.now()
    mock_article.updated_at = datetime.now()
    mock_article.comment_count = 0
    mock_article.reaction_count = 0
    mock_article.user = create_mock_user(user_id)
    mock_article.channel = None
    mock_article.medias = []
    return mock_article


def test_create_article():
    mock_db = MagicMock()
    mock_user = create_mock_user()
    mock_article = create_mock_article()
    
    with patch("src.api.article.api.create_article", return_value=mock_article):
        with patch("src.api.article.api.get_article", return_value=mock_article):
            with patch("src.api.article.api.get_reactions_summary", return_value={}):
                with patch("src.api.article.api.get_comment_summary", return_value={}):
                    app.dependency_overrides[get_db] = lambda: mock_db
                    app.dependency_overrides[get_current_user] = lambda: mock_user
                    
                    response = client.post("/api/articles/", json={
                        "title": "Test Article",
                        "content": "Test content",
                        "user_id": "user123"
                    })
                    
                    app.dependency_overrides.clear()
                    assert response.status_code == 200


def test_get_article():
    mock_db = MagicMock()
    mock_article = create_mock_article()
    
    with patch("src.api.article.api.get_article", return_value=mock_article):
        with patch("src.api.article.api.get_reactions_summary", return_value={}):
            with patch("src.api.article.api.get_comment_summary", return_value={}):
                app.dependency_overrides[get_db] = lambda: mock_db
                
                response = client.get("/api/articles/article123")
                
                app.dependency_overrides.clear()
                assert response.status_code == 200


def test_get_all_articles():
    mock_db = MagicMock()
    
    with patch("src.api.article.api.get_all_articles", return_value=[]):
        app.dependency_overrides[get_db] = lambda: mock_db
        
        response = client.get("/api/articles/")
        
        app.dependency_overrides.clear()
        assert response.status_code == 200
        assert isinstance(response.json(), list)


def test_update_article():
    mock_db = MagicMock()
    mock_user = create_mock_user()
    mock_article = create_mock_article(title="Updated Article")
    
    with patch("src.api.article.api.update_article", return_value=mock_article):
        with patch("src.api.article.api.get_article", return_value=mock_article):
            with patch("src.api.article.api.get_reactions_summary", return_value={}):
                with patch("src.api.article.api.get_comment_summary", return_value={}):
                    app.dependency_overrides[get_db] = lambda: mock_db
                    app.dependency_overrides[get_current_user] = lambda: mock_user
                    
                    response = client.put("/api/articles/article123", json={"title": "Updated Article"})
                    
                    app.dependency_overrides.clear()
                    assert response.status_code == 200


def test_delete_article():
    mock_db = MagicMock()
    mock_user = create_mock_user()
    
    with patch("src.api.article.api.delete_article", return_value=True):
        app.dependency_overrides[get_db] = lambda: mock_db
        app.dependency_overrides[get_current_user] = lambda: mock_user
        
        response = client.delete("/api/articles/article123")
        
        app.dependency_overrides.clear()
        assert response.status_code == 200
        assert "message" in response.json()
