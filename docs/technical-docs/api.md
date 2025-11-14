# API Documentation

## Overview

The OpenCircle API is built with Python 3.12+ and FastAPI, following a modular architecture with clear separation between API routes, business logic, and data models.

## Technology Stack

- **FastAPI**: High-performance async web framework
- **SQLModel**: ORM combining SQLAlchemy and Pydantic
- **Alembic**: Database migrations
- **PostgreSQL 15**: Primary database
- **Redis**: Caching and message broker
- **Celery**: Background task processing
- **UV**: Fast Python package manager
- **Ruff**: Python linting
- **Pytest**: Testing framework

## Project Structure

```
apps/api/
├── src/
│   ├── main.py              # Application entry point
│   ├── api/                 # API routes and serializers
│   │   ├── auth/           # Authentication endpoints
│   │   ├── user/           # User management
│   │   ├── account/        # Account/profile management
│   │   ├── courses/        # Course endpoints
│   │   ├── article/        # Article endpoints
│   │   ├── post/           # Post and comment endpoints
│   │   ├── channels/       # Channel endpoints
│   │   ├── channel_members/ # Channel membership
│   │   ├── media/          # Media upload endpoints
│   │   ├── reaction/       # Reaction endpoints
│   │   ├── notifications/  # Notification endpoints
│   │   ├── invite_code/    # Invite code endpoints
│   │   ├── appsettings/    # App settings endpoints
│   │   └── extras/         # Utility endpoints (URL preview)
│   ├── modules/            # Business logic layer
│   │   ├── auth/          # Auth methods (JWT, OAuth)
│   │   ├── user/          # User business logic
│   │   ├── courses/       # Course business logic
│   │   ├── article/       # Article business logic
│   │   ├── post/          # Post business logic
│   │   ├── channels/      # Channel business logic
│   │   ├── media/         # Media handling
│   │   ├── reaction/      # Reaction business logic
│   │   ├── notifications/ # Notification logic & Celery tasks
│   │   ├── invite_code/   # Invite code logic
│   │   ├── appsettings/   # App settings logic
│   │   ├── storages/      # Cloud storage (R2) integration
│   │   └── extras/        # Utility functions (URL preview)
│   ├── database/
│   │   ├── models.py      # SQLModel database models
│   │   └── engine.py      # Database engine and session
│   └── core/
│       ├── settings.py    # Application settings
│       ├── common.py      # Common utilities
│       ├── base_models.py # Base model classes
│       └── celery_app.py  # Celery configuration
├── alembic/               # Database migrations
├── tests/                 # Test suite
├── pyproject.toml         # Python dependencies
└── alembic.ini           # Alembic configuration
```

## Architecture Patterns

### 1. Layered Architecture

The API follows a clean three-layer architecture:

**API Layer** (`src/api/`):
- Defines FastAPI routes and endpoints
- Request/response validation with Pydantic serializers
- Dependency injection (authentication, database sessions)
- HTTP-specific logic

**Business Logic Layer** (`src/modules/`):
- Pure business logic independent of HTTP
- Database operations and transactions
- Domain-specific rules and validation
- Reusable across different interfaces

**Data Layer** (`src/database/`):
- SQLModel models with type safety
- Database schema definitions
- Relationships and constraints

### 2. Module Pattern

Each feature is organized as a module with consistent structure:

```
modules/feature_name/
├── __init__.py
├── feature_methods.py    # Business logic functions
└── utils.py             # Helper functions (optional)

api/feature_name/
├── __init__.py
├── api.py               # FastAPI routes
└── serializer.py        # Pydantic request/response models
```

### 3. Dependency Injection

Common dependencies used across endpoints:

```python
# Database session
def get_session() -> Generator[Session, None, None]:
    """Provides database session with automatic cleanup."""

# Authentication
async def get_current_user(token: str) -> User:
    """Validates JWT and returns authenticated user."""

async def get_current_admin(current_user: User) -> User:
    """Ensures user has admin role."""
```

## Core Models

### Database Enums

```python
class Role(str, Enum):
    ADMIN = "admin"
    USER = "user"

class CourseStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class LessonType(str, Enum):
    VIDEO = "video"
    TEXT = "text"
    QUIZ = "quiz"
    ASSIGNMENT = "assignment"

class PostType(str, Enum):
    POST = "post"
    COMMENT = "comment"
    ARTICLE = "article"

class NotificationType(str, Enum):
    MENTION = "mention"
    REACTION = "reaction"
    COMMENT = "comment"
    FOLLOW = "follow"
```

### Key Models

**User**:
- Authentication and profile information
- Roles (admin/user)
- Relationships to posts, media, enrollments, notifications

**Course**:
- Title, description, status (draft/published/archived)
- Has many sections
- Enrollment relationship with users

**Section**:
- Belongs to course
- Ordered list of sections
- Has many lessons

**Lesson**:
- Belongs to section
- Type (video/text/quiz/assignment)
- Content and metadata

**Post**:
- Social posts and comments
- Parent/child relationship for threading
- Mentions and reactions
- Channel association

**Article**:
- Long-form content with markdown
- Cover image and metadata

**Channel**:
- Discussion channels
- Public/private visibility
- Member management

**Notification**:
- User notifications
- Type and context (mention, reaction, etc.)
- Read/unread status

## API Modules

### Authentication (`auth`)

**Features**:
- JWT-based authentication
- GitHub OAuth integration
- Token generation and validation
- Password hashing with bcrypt

**Endpoints**:
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/register` - User registration
- `GET /api/auth/github` - GitHub OAuth initiation
- `GET /api/auth/github/callback` - GitHub OAuth callback

**Key Functions**:
```python
def create_access_token(data: dict) -> str:
    """Generate JWT access token."""

def verify_token(token: str) -> dict:
    """Validate and decode JWT token."""

def hash_password(password: str) -> str:
    """Hash password with bcrypt."""

def verify_password(plain: str, hashed: str) -> bool:
    """Verify password against hash."""
```

### Users (`user`)

**Features**:
- User profile management
- User search and discovery
- Username uniqueness validation

**Endpoints**:
- `GET /api/users` - List users
- `GET /api/users/{username}` - Get user by username
- `PUT /api/users/{id}` - Update user profile
- `DELETE /api/users/{id}` - Delete user (admin)

### Courses (`courses`)

**Features**:
- Course CRUD operations
- Section and lesson management
- Enrollment management
- Progress tracking

**Endpoints**:
- `GET /api/courses` - List courses
- `GET /api/courses/{id}` - Get course details
- `POST /api/courses` - Create course (admin)
- `PUT /api/courses/{id}` - Update course (admin)
- `DELETE /api/courses/{id}` - Delete course (admin)
- `POST /api/courses/{id}/enroll` - Enroll in course
- `GET /api/courses/{id}/sections` - Get course sections
- `POST /api/courses/{id}/sections` - Create section (admin)
- `GET /api/sections/{id}/lessons` - Get section lessons
- `POST /api/sections/{id}/lessons` - Create lesson (admin)

### Posts (`post`)

**Features**:
- Create posts and comments
- Threading with parent/child relationships
- Mention parsing and notifications
- Content rendering with markdown support
- URL preview generation

**Endpoints**:
- `GET /api/posts` - List posts (timeline)
- `GET /api/posts/{id}` - Get post with comments
- `POST /api/posts` - Create post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post
- `GET /api/posts/{id}/replies` - Get post replies

**Key Features**:
```python
def parse_mentions(content: str) -> List[str]:
    """Extract @mentions from post content."""

def create_post_with_mentions(content: str, user_id: str, channel_id: str):
    """Create post and trigger mention notifications."""
```

### Articles (`article`)

**Features**:
- Long-form content management
- Markdown support with frontmatter
- Cover images
- Publishing workflow

**Endpoints**:
- `GET /api/articles` - List articles
- `GET /api/articles/{id}` - Get article
- `POST /api/articles` - Create article (admin)
- `PUT /api/articles/{id}` - Update article (admin)
- `DELETE /api/articles/{id}` - Delete article (admin)

### Channels (`channels`)

**Features**:
- Channel CRUD operations
- Member management
- Public/private channels
- Auto-join with invite codes

**Endpoints**:
- `GET /api/channels` - List channels
- `GET /api/channels/{id}` - Get channel
- `POST /api/channels` - Create channel (admin)
- `PUT /api/channels/{id}` - Update channel (admin)
- `POST /api/channels/{id}/join` - Join channel
- `DELETE /api/channels/{id}/leave` - Leave channel

### Media (`media`)

**Features**:
- File upload to Cloudflare R2
- Image optimization
- Secure URLs
- Usage tracking

**Endpoints**:
- `POST /api/media/upload` - Upload file
- `GET /api/media/{id}` - Get media metadata
- `DELETE /api/media/{id}` - Delete media

**Storage Integration**:
```python
def upload_to_r2(file: UploadFile, folder: str) -> str:
    """Upload file to Cloudflare R2 and return public URL."""
```

### Reactions (`reaction`)

**Features**:
- Emoji reactions on posts
- Reaction counts
- User reaction tracking

**Endpoints**:
- `POST /api/reactions` - Add reaction
- `DELETE /api/reactions/{id}` - Remove reaction
- `GET /api/posts/{id}/reactions` - Get post reactions

### Notifications (`notifications`)

**Features**:
- Real-time notification system
- Celery background tasks
- Multiple notification types (mention, reaction, comment)
- Read/unread status

**Endpoints**:
- `GET /api/notifications` - List user notifications
- `PUT /api/notifications/{id}/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

**Background Tasks**:
```python
@celery_app.task
def send_mention_notification(user_id: str, post_id: str, mentioned_by: str):
    """Send notification for post mention."""

@celery_app.task
def send_reaction_notification(user_id: str, post_id: str, reaction: str):
    """Send notification for post reaction."""
```

### Invite Codes (`invite_code`)

**Features**:
- Generate unique invite codes
- Usage limits and expiration
- Auto-join channels
- Usage tracking

**Endpoints**:
- `GET /api/invite-codes` - List codes (admin)
- `POST /api/invite-codes` - Generate code (admin)
- `PUT /api/invite-codes/{id}` - Update code (admin)
- `DELETE /api/invite-codes/{id}` - Delete code (admin)
- `POST /api/invite-codes/validate` - Validate and use code

### App Settings (`appsettings`)

**Features**:
- Global application configuration
- App name and branding
- Feature toggles (sign-up enabled)

**Endpoints**:
- `GET /api/appsettings` - Get settings
- `PUT /api/appsettings` - Update settings (admin)

### Extras (`extras`)

**Features**:
- URL preview generation
- Open Graph metadata extraction

**Endpoints**:
- `POST /api/extras/url-preview` - Generate URL preview

## Database Migrations

### Using Alembic

```bash
# Create new migration
cd apps/api
uv run alembic revision -m "description"

# Apply migrations
uv run alembic upgrade head

# Rollback migration
uv run alembic downgrade -1

# View migration history
uv run alembic history
```

### Migration Files

Located in `apps/api/alembic/versions/`. Each migration contains:
- `upgrade()`: Forward migration
- `downgrade()`: Rollback migration

## Background Tasks with Celery

### Configuration

```python
# src/core/celery_app.py
from celery import Celery

celery_app = Celery(
    "opencircle",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)
```

### Task Examples

```python
# Notification task
@celery_app.task
def send_notification(user_id: str, notification_data: dict):
    """Create and send notification to user."""
    # Task implementation
```

### Running Celery

```bash
# Start worker
cd apps/api
uv run celery -A src.core.celery_app worker --loglevel=info

# With beat scheduler (for periodic tasks)
uv run celery -A src.core.celery_app worker --beat --loglevel=info
```

## Authentication & Authorization

### JWT Authentication

```python
# Generate token on login
token = create_access_token({"sub": user.id, "role": user.role})

# Verify token on protected routes
@router.get("/protected")
async def protected_route(current_user: User = Depends(get_current_user)):
    return {"user": current_user}
```

### Role-Based Access Control

```python
# Admin-only endpoint
@router.post("/admin-only")
async def admin_endpoint(admin: User = Depends(get_current_admin)):
    # Only admins can access
    pass
```

### GitHub OAuth Flow

1. User clicks "Sign in with GitHub"
2. Redirect to `/api/auth/github`
3. Redirect to GitHub OAuth page
4. GitHub redirects to `/api/auth/github/callback`
5. API creates or updates user
6. Return JWT token

## Testing

### Running Tests

```bash
cd apps/api

# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=src --cov-report=html

# Run specific test file
uv run pytest tests/test_auth.py

# Run with verbose output
uv run pytest -v
```

### Test Structure

```
tests/
├── conftest.py          # Fixtures and test configuration
├── test_auth.py         # Authentication tests
├── test_users.py        # User endpoint tests
├── test_courses.py      # Course endpoint tests
└── test_posts.py        # Post endpoint tests
```

### Common Fixtures

```python
@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)

@pytest.fixture
def db_session():
    """Test database session."""
    # Setup and teardown

@pytest.fixture
def auth_headers(test_user):
    """Authenticated request headers."""
    token = create_access_token({"sub": test_user.id})
    return {"Authorization": f"Bearer {token}"}
```

## Type Checking

```bash
cd apps/api

# Type check with Typer
uv run ty check .

# Type check specific file
uv run ty check src/modules/auth/auth_methods.py
```

## Code Quality

### Linting with Ruff

```bash
cd apps/api

# Lint code
uv run ruff check .

# Auto-fix issues
uv run ruff check --fix .

# Format code
uv run ruff format .
```

### Configuration

See `ruff.toml` for linting rules and configuration.

## Environment Variables

Key environment variables for the API:

```bash
# Database
DB_URL=postgresql://user:pass@host:5432/dbname

# Redis & Celery
REDIS_URL=redis://localhost:6379
CELERY_BROKER_URL=redis://localhost:6379
CELERY_RESULT_BACKEND=redis://localhost:6379

# Cloudflare R2
R2_ENDPOINT_URL=https://...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=https://...

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440

# GitHub OAuth
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_REDIRECT_URI=http://localhost:3000/github-callback

# CORS
PLATFORM_URL=http://localhost:3000
ADMIN_URL=http://localhost:4000
```

## Best Practices

### 1. Serializers
- Use Pydantic models for request/response validation
- Separate models for create/update/response
- Include only necessary fields

### 2. Error Handling
```python
from fastapi import HTTPException, status

# Raise appropriate HTTP exceptions
if not user:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found"
    )
```

### 3. Database Sessions
- Always use dependency injection for sessions
- Let FastAPI handle session lifecycle
- Don't commit in business logic unless necessary

### 4. Async/Await
- Use async for I/O-bound operations
- Database queries can be sync (SQLModel/SQLAlchemy)
- External API calls should be async

### 5. Security
- Never log sensitive data (passwords, tokens)
- Use parameterized queries (SQLModel handles this)
- Validate and sanitize user input
- Use HTTPS in production
