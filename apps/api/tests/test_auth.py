import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from src.main import app

client = TestClient(app)


def test_register(monkeypatch):
    mock_db = MagicMock()
    mock_user = MagicMock()
    mock_user.id = "user123"
    
    # Mock app settings to allow registration
    mock_app_settings = MagicMock()
    mock_app_settings.enable_sign_up = True
    
    monkeypatch.setattr(
        "src.modules.appsettings.appsettings_methods.get_active_app_settings",
        lambda *args, **kwargs: mock_app_settings
    )
    monkeypatch.setattr(
        "src.api.auth.api.register_user", lambda *args, **kwargs: mock_user
    )
    app.dependency_overrides[
        app.dependency_overrides.get("get_db", lambda: mock_db)
    ] = lambda: mock_db

    response = client.post(
        "/api/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password",
        },
    )
    assert response.status_code == 200
    assert "user_id" in response.json()


def test_register_disabled(monkeypatch):
    mock_db = MagicMock()
    
    # Mock app settings to disable registration
    mock_app_settings = MagicMock()
    mock_app_settings.enable_sign_up = False
    
    monkeypatch.setattr(
        "src.modules.appsettings.appsettings_methods.get_active_app_settings",
        lambda *args, **kwargs: mock_app_settings
    )
    app.dependency_overrides[
        app.dependency_overrides.get("get_db", lambda: mock_db)
    ] = lambda: mock_db

    response = client.post(
        "/api/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password",
        },
    )
    assert response.status_code == 403
    assert "disabled" in response.json()["detail"].lower()


def test_login(monkeypatch):
    mock_db = MagicMock()
    mock_user = MagicMock()
    mock_user.is_active = True
    mock_result = {"access_token": "token", "token_type": "bearer"}
    
    # Mock get_user_by_username to return an active user
    monkeypatch.setattr(
        "src.modules.user.user_methods.get_user_by_username", lambda *args, **kwargs: mock_user
    )
    # Mock login_user to return the token
    monkeypatch.setattr(
        "src.api.auth.api.login_user", lambda *args, **kwargs: mock_result
    )
    app.dependency_overrides[
        app.dependency_overrides.get("get_db", lambda: mock_db)
    ] = lambda: mock_db

    response = client.post(
        "/api/login", json={"username": "testuser", "password": "password"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_banned_user(monkeypatch):
    mock_db = MagicMock()
    mock_user = MagicMock()
    mock_user.is_active = False  # Banned user
    
    # Mock get_user_by_username to return a banned user
    monkeypatch.setattr(
        "src.modules.user.user_methods.get_user_by_username", lambda *args, **kwargs: mock_user
    )
    app.dependency_overrides[
        app.dependency_overrides.get("get_db", lambda: mock_db)
    ] = lambda: mock_db

    response = client.post(
        "/api/login", json={"username": "banneduser", "password": "password"}
    )
    assert response.status_code == 403
    assert "banned" in response.json()["detail"].lower()
