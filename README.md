# OpenCircle

OpenCircle is an open-source social learning platform that combines online education with community interaction. It allows users to enroll in courses, participate in channels, share articles, and engage through posts and reactions, fostering a collaborative learning environment.

## Features

- **User Management**: Registration, authentication, and profile management.
- **Courses**: Create, manage, and enroll in educational courses with lessons and sections.
- **Channels**: Join and participate in discussion channels for community interaction.
- **Articles and Posts**: Share and read articles, create posts, and react to content.
- **Notifications**: Real-time notifications for user activities.
- **Media Handling**: Upload and manage media files.
- **Invite Codes**: Generate and use invite codes for user access.
- **Admin Dashboard**: Comprehensive admin interface for managing content and users.

## Architecture

OpenCircle is a monorepo project structured as follows:

- **Admin App** (`apps/admin/`): React-based admin interface for managing the platform.
- **Platform App** (`apps/platform/`): React-based user-facing application for learning and social features.
- **API** (`api/`): Python-based backend API handling data and business logic.
- **Packages** (`packages/`): Shared components and services (e.g., UI components, core services).

The project uses modern technologies including React with TypeScript, TanStack Router and Query, Tailwind CSS for frontends, and Python with FastAPI for the backend.

## Installation

### Prerequisites

- Docker and Docker Compose for running the application.

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/devscalelabs/opencircle.git
   cd opencircle
   ```

2. **Set up environment variables**:
   - Copy `.env.example` to `.env` and configure your settings (e.g., R2 storage, database credentials).

3. **Build and start the services**:
   - Use the Makefile commands for ease.

## Usage

### Running the Applications

1. **Run database migrations**:
   ```bash
   make docker-migrate
   ```

2. **Start all services**:
   ```bash
   make docker-up
   ```

Access the applications:
- Admin Dashboard: http://localhost:4000
- Platform: http://localhost:3000
- API: http://localhost:8000
- Database Admin (Adminer): http://localhost:8080 (optional)

To stop the services:
```bash
make docker-down
```

For development, you can also use:
```bash
make dev
```
This runs the Moon development setup.

### Building for Production

1. **Build the frontends**:
   ```bash
   pnpm --filter admin build
   pnpm --filter platform build
   ```

2. **Build the API** (if needed):
   Follow Python packaging instructions in `api/`.

## Contributing

Currently, contributions are not accepted. Please report issues only via the [Issues](https://github.com/devscalelabs/opencircle/issues) page.

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Contact

For issues and questions, please use the [GitHub Issues](https://github.com/devscalelabs/opencircle/issues) page.