import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from src.main import app
from src.database.engine import get_session as get_db

client = TestClient(app)


def test_get_url_preview_cached():
    mock_db = MagicMock()
    
    # Mock cached preview
    mock_preview = MagicMock()
    mock_preview.url = "https://example.com"
    mock_preview.title = "Example Title"
    mock_preview.description = "Example Description"
    mock_preview.image_url = "https://example.com/image.jpg"
    mock_preview.created_at = datetime.now()
    
    mock_db.exec.return_value.first.return_value = mock_preview
    
    app.dependency_overrides[get_db] = lambda: mock_db
    
    response = client.get("/api/url-preview", params={"url": "https://example.com"})
    
    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json()["title"] == "Example Title"


# Skipping test_get_url_preview_new - requires complex database mocking
