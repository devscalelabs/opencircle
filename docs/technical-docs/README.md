# OpenCircle Documentation

Welcome to the OpenCircle technical documentation. This guide will help you understand the architecture, development patterns, and best practices for contributing to OpenCircle.

## Documentation Structure

### Architecture Documentation

- **[API Documentation](api.md)** - Backend architecture and development guide
  - FastAPI backend structure
  - Database models and migrations
  - API modules and endpoints
  - Authentication and authorization
  - Background tasks with Celery
  - Testing and deployment

- **[Admin App Documentation](admin.md)** - Admin dashboard guide
  - React admin interface structure
  - Feature modules and components
  - TanStack Router and Query patterns
  - User, course, and content management
  - State management with Jotai

- **[Platform App Documentation](platform.md)** - User platform guide
  - User-facing application structure
  - Social features and timeline
  - Course learning experience
  - Notifications and mentions
  - Content rendering and forms

## Getting Started

### For New Developers

1. **Read the [main README](../README.md)** to understand the project and quick start
2. **Choose your focus area**:
   - Backend development? Start with [API Documentation](api.md)
   - Admin features? Read [Admin App Documentation](admin.md)
   - User features? Check [Platform App Documentation](platform.md)
3. **Set up your development environment** following the quick start guide
4. **Explore the codebase** using the architecture documentation as your guide

### Key Technologies

**Frontend:**
- React 19 + TypeScript
- TanStack Router (file-based routing)
- TanStack Query (data fetching)
- Tailwind CSS 4
- Radix UI

**Backend:**
- Python 3.12 + FastAPI
- PostgreSQL + SQLModel
- Redis + Celery
- Alembic (migrations)

**DevOps:**
- Docker & Docker Compose
- pnpm + Moon (monorepo)
- GitHub Actions

## Development Workflow

### 1. Code Organization

OpenCircle follows a feature-based architecture:

```
apps/
├── admin/src/features/     # Admin features (user, course, article, etc.)
├── platform/src/features/  # Platform features (posts, timeline, etc.)
└── api/src/
    ├── api/               # API routes
    └── modules/           # Business logic
```

### 2. Common Patterns

**Frontend (React):**
- Custom hooks for data fetching
- Feature-based organization
- File-based routing
- Shared components and packages

**Backend (FastAPI):**
- Layered architecture (API → Modules → Database)
- Dependency injection
- Pydantic serializers
- SQLModel for ORM

### 3. Development Commands

```bash
# Start all services
make dev

# Format code
make format

# Lint code  
pnpm lint

# Run tests
cd apps/api && uv run pytest

# Database migrations
cd apps/api && uv run alembic revision -m "description"
cd apps/api && uv run alembic upgrade head
```

## Architecture Overview

### Monorepo Structure

```
opencircle/
├── apps/
│   ├── admin/      # Admin dashboard (React + TypeScript)
│   ├── platform/   # User platform (React + TypeScript)
│   └── api/        # Backend API (Python + FastAPI)
├── packages/
│   ├── core/       # Shared services (@opencircle/core)
│   └── ui/         # Shared components (@opencircle/ui)
└── docs/           # Documentation
```

### Data Flow

```
User Interface (React)
    ↓
TanStack Query (caching)
    ↓
API Services (@opencircle/core)
    ↓
FastAPI Routes (validation)
    ↓
Business Logic Modules
    ↓
Database (PostgreSQL)
```

### Background Tasks

```
API Request → Create Notification
    ↓
Celery Task Queue (Redis)
    ↓
Celery Worker
    ↓
Database Update
```

## Key Features by Application

### Admin App
- User management
- Course creation and management
- Article publishing
- Channel management
- Invite code generation
- App settings
- Broadcasting

### Platform App
- User authentication (email/password, GitHub OAuth)
- Social timeline with posts
- Course browsing and enrollment
- Lesson viewer
- Article reading
- Notifications
- Mentions and reactions
- Channel participation

### API
- RESTful endpoints
- JWT authentication
- GitHub OAuth integration
- File uploads (Cloudflare R2)
- Background notifications
- URL preview generation
- Real-time data synchronization

## Contributing Guidelines

### Code Style

**TypeScript/React:**
- Use functional components
- Custom hooks for logic
- Proper TypeScript types
- Biome for formatting

**Python:**
- Follow PEP 8
- Type hints everywhere
- Docstrings for public functions
- Ruff for linting

### Testing

- Write tests for new features
- Maintain test coverage
- Test edge cases
- Use fixtures and mocks appropriately

### Git Workflow

1. Create feature branch from `main`
2. Make atomic commits with clear messages
3. Run linting and tests before committing
4. Submit PR with description
5. Address review feedback

## Troubleshooting

### Common Issues

**Docker issues:**
```bash
# Clean and rebuild
make docker-clean
make docker-rebuild
```

**Database issues:**
```bash
# Reset database (WARNING: deletes data)
make docker-db-reset
```

**Frontend build issues:**
```bash
# Clean install
rm -rf node_modules package-lock.json
pnpm install
```

**API issues:**
```bash
# Reinstall dependencies
cd apps/api
rm -rf .venv
uv sync
```

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [React Documentation](https://react.dev/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## Questions?

For issues and questions, please use the [GitHub Issues](https://github.com/devscalelabs/opencircle/issues) page.
