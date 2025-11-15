# OpenCircle

![OpenCircle Platform](docs/screenshots/main.png)

OpenCircle is an open-source social learning platform that combines online education with community interaction. Learn together, share knowledge, and build a vibrant learning community.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![React 19](https://img.shields.io/badge/react-19-blue.svg)](https://react.dev/)

> **Note**: This project is currently in alpha. Features and APIs may change.

## Features

### Core Features
- **User Management**: Registration, authentication (including GitHub OAuth), profile management, user roles (Admin/User)
- **Courses & Learning**: Create, manage, and enroll in educational courses with structured sections and lessons (video, text, quiz, assignment types)
- **Channels**: Join and participate in topic-based discussion channels for community interaction
- **Articles & Posts**: Share and read articles, create posts with mentions and URL previews, comment and reply to discussions
- **Reactions**: React to posts and content with emoji reactions
- **Notifications**: Real-time notifications for mentions, reactions, and user activities
- **Media Handling**: Upload and manage media files with cloud storage support (Cloudflare R2)
- **Invite Codes**: Generate and manage invite codes with usage limits, expiration, and auto-channel joining
- **Admin Dashboard**: Comprehensive admin interface for managing users, content, courses, articles, channels, and app settings
- **Broadcasting**: Admin ability to broadcast messages to users

### Technical Features
- GitHub OAuth authentication
- Markdown support with syntax highlighting for articles and posts
- URL preview generation for shared links
- Mention system with autocomplete
- Background task processing with Celery and Redis
- Responsive design with mobile-first approach
- Dark mode support
- Real-time data synchronization

## Technology Stack

### Frontend
- React 19 + TypeScript
- TanStack Router & Query
- Tailwind CSS 4
- Radix UI Components

### Backend
- Python 3.12 + FastAPI
- PostgreSQL + SQLModel
- Redis + Celery
- Cloudflare R2 Storage

### DevOps
- Docker & Docker Compose
- pnpm + Moon (monorepo)
- GitHub Actions CI/CD

## Architecture

OpenCircle is built as a modern monorepo with three main applications:

- **Platform App**: User-facing React application for learning and community
- **Admin App**: React-based dashboard for content and user management
- **API**: FastAPI backend with modular architecture

For detailed architecture and development patterns, see the [documentation](docs/):
- [API Documentation](docs/api.md) - Backend architecture, modules, and patterns
- [Admin App Documentation](docs/admin.md) - Admin interface structure and features
- [Platform App Documentation](docs/platform.md) - User app structure and features

## Quick Start

### Using Docker (Recommended)

1. **Clone and configure**:
   ```bash
   git clone https://github.com/devscalelabs/opencircle.git
   cd opencircle
   cp .env.example .env
   ```

2. **Configure environment** (edit `.env`):
   - Cloudflare R2 credentials for media storage
   - Database and Redis URLs (defaults work for Docker)

3. **Start the platform**:
   ```bash
   make docker-migrate  # Run database migrations
   make docker-up       # Start all services
   ```

4. **Access the applications**:
   - **Platform**: http://localhost:3000
   - **Admin Dashboard**: http://localhost:4000
   - **API Documentation**: http://localhost:8000/docs

### Local Development

**Prerequisites**: Node.js 20+, Python 3.12+, pnpm, PostgreSQL, Redis

```bash
# Install dependencies
pnpm install
cd apps/api && uv sync && cd ../..

# Start services
docker compose up -d postgres redis  # Or use local instances
cd apps/api && uv run alembic upgrade head && cd ../..

# Run applications
make dev  # Starts all apps with Moon
```

See the [development documentation](docs/) for detailed setup instructions.

## Project Structure

```
opencircle/
├── apps/
│   ├── admin/       # Admin dashboard (React + TypeScript)
│   ├── platform/    # User platform (React + TypeScript)
│   └── api/         # Backend API (Python + FastAPI)
├── packages/
│   ├── core/        # Shared TypeScript services
│   └── ui/          # Shared React components
├── docs/            # Documentation
└── docker-compose.yml
```

## Documentation

- **[API Documentation](docs/api.md)**: Backend architecture, modules, database models, and API patterns
- **[Admin App Documentation](docs/admin.md)**: Admin interface features, components, and workflows
- **[Platform App Documentation](docs/platform.md)**: User app features, components, and architecture

## Common Commands

```bash
# Docker
make docker-up         # Start all services
make docker-down       # Stop all services
make docker-migrate    # Run database migrations
make docker-logs       # View logs

# Development
make dev              # Start dev servers
make format           # Format code
pnpm lint             # Lint code

# Testing
cd apps/api && uv run pytest  # Run API tests
```

## Configuration

Key environment variables (see `.env.example`):

- **Cloudflare R2**: Media storage configuration
- **Database**: PostgreSQL connection details
- **Redis**: Caching and task queue
- **OAuth**: GitHub OAuth credentials (optional)

For detailed configuration, see the [API documentation](docs/api.md#environment-variables).

## Contributing

Currently, contributions are not accepted. Please report issues only via the [Issues](https://github.com/devscalelabs/opencircle/issues) page.

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Contact

For issues and questions, please use the [GitHub Issues](https://github.com/devscalelabs/opencircle/issues) page.