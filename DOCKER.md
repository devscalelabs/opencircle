# Docker Setup

This document describes the Docker configuration for the OpenCircle monorepo applications.

## Applications

### API (FastAPI)
- **Location**: `apps/api/Dockerfile`
- **Base Image**: Python 3.12-slim
- **Package Manager**: uv
- **Port**: 8000
- **Health Check**: `/health`

### Platform (React/Vite)
- **Location**: `apps/platform/Dockerfile`
- **Base Image**: nginx:alpine (multi-stage build with Node.js 18-alpine)
- **Package Manager**: pnpm
- **Port**: 80
- **Health Check**: `/health`

### Admin (React/Vite)
- **Location**: `apps/admin/Dockerfile`
- **Base Image**: nginx:alpine (multi-stage build with Node.js 18-alpine)
- **Package Manager**: pnpm
- **Port**: 80
- **Health Check**: `/health`

## Local Development

### Build Images

```bash
# Build API
docker build -t opencircle-api -f apps/api/Dockerfile .

# Build Platform
docker build -t opencircle-platform -f apps/platform/Dockerfile .

# Build Admin
docker build -t opencircle-admin -f apps/admin/Dockerfile .
```

### Run Containers

```bash
# Run API
docker run -p 8000:8000 opencircle-api

# Run Platform
docker run -p 3001:80 opencircle-platform

# Run Admin
docker run -p 4001:80 opencircle-admin
```

### Health Checks

```bash
# API Health
curl http://localhost:8000/health

# Platform Health
curl http://localhost:3001/health

# Admin Health
curl http://localhost:4001/health
```

## GitHub Actions

### Automated Build and Push

The repository includes GitHub Actions workflows for automated Docker image building and pushing:

- **docker-build.yml**: Automated builds on push to main/develop branches and tags
- **docker-test.yml**: Manual workflow for testing builds

### Registry

Images are pushed to GitHub Container Registry (GHCR):
- `ghcr.io/opencircle/api`
- `ghcr.io/opencircle/platform`
- `ghcr.io/opencircle/admin`

### Image Tags

- `main` branch: `main`, `main-{sha}`
- `develop` branch: `develop`, `develop-{sha}`
- Tags: `v1.0.0`, `v1.0`, `v1`
- Pull requests: `pr-{number}`

## Production Considerations

### Environment Variables

#### API
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string

#### Platform & Admin
- No environment variables required for static builds

### Security

- All images use non-root users where applicable
- Security headers configured in nginx
- Multi-stage builds minimize attack surface
- Regular security scans via GitHub Actions

### Performance

- Nginx gzip compression enabled
- Static asset caching configured
- Multi-platform builds (amd64/arm64)
- Layer caching in CI/CD

## Troubleshooting

### Build Issues

1. **Monorepo Dependencies**: Ensure workspace files are copied correctly
2. **Permission Issues**: Check file permissions in Docker context
3. **Cache Issues**: Use `--no-cache` flag for clean builds

### Runtime Issues

1. **Port Conflicts**: Check if ports are already in use
2. **Health Checks**: Verify application is responding on expected endpoints
3. **Network Issues**: Ensure containers can access required services

### Development Workflow

1. Make changes to application code
2. Test locally with Docker build
3. Push to trigger automated builds
4. Monitor GitHub Actions for build status
5. Deploy using appropriate image tags

## Best Practices

- Use specific image tags in production (not `latest`)
- Regularly update base images for security
- Monitor image sizes and optimize builds
- Implement proper logging and monitoring
- Use environment-specific configurations
