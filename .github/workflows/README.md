# GitHub Workflows

This directory contains GitHub Actions workflows for the OpenCircle project.

## Workflows

### docker-build.yml
**Trigger**: Push to `main`/`develop` branches, tags, and pull requests

**Purpose**: Automatically build and push Docker images for all applications

**Features**:
- Multi-platform builds (linux/amd64, linux/arm64)
- Automated tagging based on branch/tag/PR
- GitHub Container Registry integration
- Build caching for faster CI/CD
- Matrix strategy for parallel builds

**Matrix Applications**:
- `api`: FastAPI backend service
- `platform`: React frontend application
- `admin`: React admin dashboard

**Image Tags**:
- Branch pushes: `main`, `develop`, `{branch}-{sha}`
- Tags: `v1.0.0`, `v1.0`, `v1`
- Pull requests: `pr-{number}`

**Registry**: `ghcr.io/opencircle/{app}`

### docker-test.yml
**Trigger**: Manual workflow dispatch

**Purpose**: Test Docker builds before merging or for debugging

**Features**:
- Manual app selection (api/platform/admin)
- Optional registry push
- Container health checks
- Build testing without merge

**Inputs**:
- `app`: Choose which application to build
- `push_to_registry`: Whether to push to GHCR

## Usage

### Automated Builds
Simply push to `main` or `develop` branch, or create a tag. Images will be built and pushed automatically.

### Manual Testing
1. Go to Actions tab in GitHub
2. Select "Manual Docker Build Test" workflow
3. Choose app to build
4. Optionally enable registry push
5. Click "Run workflow"

### Pull Requests
Pull requests trigger builds but do not push images to the registry.

## Security

- Uses GitHub token for authentication
- Minimal permissions required
- No secrets exposed in logs
- Container registry access controlled by repository permissions

## Monitoring

- Build progress visible in Actions tab
- Failed builds create notifications
- Image digests available for verification
- Build artifacts cached for performance

## Troubleshooting

### Build Failures
- Check Dockerfile syntax
- Verify monorepo structure
- Ensure all dependencies available
- Review build logs for specific errors

### Permission Issues
- Verify repository permissions
- Check GitHub token scopes
- Ensure container registry access

### Cache Issues
- Clear cache if needed
- Use manual workflow for testing
- Check build context changes
