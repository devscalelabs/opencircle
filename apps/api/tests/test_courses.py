import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from src.main import app
from src.database.engine import get_session as get_db

client = TestClient(app)


def create_mock_course(course_id="course123", title="Test Course"):
    """Helper to create a mocked course object"""
    mock_course = MagicMock()
    mock_course.id = course_id
    mock_course.title = title
    mock_course.description = "Test course description"
    mock_course.instructor_id = "user123"
    mock_course.status = "published"
    mock_course.created_at = datetime.now()
    mock_course.updated_at = datetime.now()
    mock_course.sections = []
    return mock_course


def create_mock_section(section_id="section123", title="Test Section"):
    """Helper to create a mocked section object"""
    mock_section = MagicMock()
    mock_section.id = section_id
    mock_section.title = title
    mock_section.description = "Test section description"
    mock_section.course_id = "course123"
    mock_section.order = 1
    mock_section.created_at = datetime.now()
    mock_section.updated_at = datetime.now()
    mock_section.lessons = []
    return mock_section


def create_mock_lesson(lesson_id="lesson123", title="Test Lesson"):
    """Helper to create a mocked lesson object"""
    mock_lesson = MagicMock()
    mock_lesson.id = lesson_id
    mock_lesson.title = title
    mock_lesson.content = "Test lesson content"
    mock_lesson.section_id = "section123"
    mock_lesson.order = 1
    mock_lesson.type = "video"
    mock_lesson.created_at = datetime.now()
    mock_lesson.updated_at = datetime.now()
    return mock_lesson


def test_create_course():
    mock_db = MagicMock()
    mock_course = create_mock_course()
    
    with patch("src.modules.courses.courses_methods.create_course", return_value=mock_course):
        app.dependency_overrides[get_db] = lambda: mock_db
        
        response = client.post("/api/courses/", json={
            "title": "Test Course",
            "description": "Test course description",
            "instructor_id": "user123"
        })
        
        app.dependency_overrides.clear()
        assert response.status_code == 200


def test_get_all_courses():
    mock_db = MagicMock()
    mock_course = create_mock_course()
    
    with patch("src.modules.courses.courses_methods.get_all_courses", return_value=[mock_course]):
        app.dependency_overrides[get_db] = lambda: mock_db
        
        response = client.get("/api/courses/")
        
        app.dependency_overrides.clear()
        assert response.status_code == 200
        assert isinstance(response.json(), list)


def test_create_section():
    mock_db = MagicMock()
    mock_section = create_mock_section()
    
    with patch("src.modules.courses.courses_methods.create_section", return_value=mock_section):
        app.dependency_overrides[get_db] = lambda: mock_db
        
        response = client.post("/api/sections/", json={
            "title": "Test Section",
            "course_id": "course123",
            "order": 1
        })
        
        app.dependency_overrides.clear()
        assert response.status_code == 200


def test_create_lesson():
    mock_db = MagicMock()
    mock_lesson = create_mock_lesson()
    
    with patch("src.modules.courses.courses_methods.create_lesson", return_value=mock_lesson):
        app.dependency_overrides[get_db] = lambda: mock_db
        
        response = client.post("/api/lessons/", json={
            "title": "Test Lesson",
            "content": "Test lesson content",
            "section_id": "section123",
            "order": 1
        })
        
        app.dependency_overrides.clear()
        assert response.status_code == 200


def test_get_section():
    mock_db = MagicMock()
    mock_section = create_mock_section()
    
    with patch("src.api.courses.api.get_section", return_value=mock_section):
        app.dependency_overrides[get_db] = lambda: mock_db
        
        response = client.get("/api/sections/section123")
        
        app.dependency_overrides.clear()
        assert response.status_code == 200
