import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from src.main import app
from src.database.engine import get_session as get_db

client = TestClient(app)


def create_mock_app_settings():
    """Helper to create a mocked app settings object"""
    mock_settings = MagicMock()
    mock_settings.id = "settings123"
    mock_settings.app_name = "OpenCircle"
    mock_settings.app_logo_url = None
    mock_settings.enable_sign_up = True
    return mock_settings


def test_get_app_settings():
    mock_db = MagicMock()
    mock_settings = create_mock_app_settings()
    
    with patch("src.modules.appsettings.appsettings_methods.get_active_app_settings", return_value=mock_settings):
        app.dependency_overrides[get_db] = lambda: mock_db
        
        response = client.get("/api/appsettings/")
        
        app.dependency_overrides.clear()
        assert response.status_code == 200


def test_update_app_settings():
    mock_db = MagicMock()
    mock_settings = create_mock_app_settings()
    mock_settings.app_name = "Updated Name"
    
    with patch("src.modules.appsettings.appsettings_methods.update_app_settings", return_value=mock_settings):
        app.dependency_overrides[get_db] = lambda: mock_db
        
        response = client.put("/api/appsettings/", json={"app_name": "Updated Name"})
        
        app.dependency_overrides.clear()
        assert response.status_code == 200


def test_get_app_settings_count():
    mock_db = MagicMock()
    
    with patch("src.modules.appsettings.appsettings_methods.get_app_settings_count", return_value=1):
        app.dependency_overrides[get_db] = lambda: mock_db
        
        response = client.get("/api/appsettings/count")
        
        app.dependency_overrides.clear()
        assert response.status_code == 200
        assert response.json()["count"] == 1
