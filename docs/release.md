# Release Guide

This guide covers how to manage releases using Changesets in our monorepo.

## Overview

We use **Changesets** for version management, which gives us:
- Manual control over when releases happen
- Clear documentation of changes
- Automatic version updates across all packages (including Python API)
- Better monorepo support

## Daily Development Workflow

### 1. Make Your Changes
```bash
# Work on your features/fixes as usual
git add .
git commit -m "feat: add new authentication system"
git push
```

### 2. Add a Changeset
After making changes that should be included in the next release:

```bash
pnpm changeset add
```

You'll be prompted to:
- **Select packages** that changed (e.g., @opencircle/core, @opencircle/ui)
- **Describe the change** in human-readable format
- **Choose version impact**:
  - `patch` (0.1.0 → 0.1.1) - Bug fixes, minor improvements
  - `minor` (0.1.0 → 0.2.0) - New features, performance improvements
  - `major` (0.1.0 → 1.0.0) - Breaking changes

This creates a `.changeset/[name].md` file documenting the change.

## Release Workflow

### When Ready to Release

#### Step 1: Update Versions
```bash
pnpm version-packages
```
This command:
- Runs `changeset version` to update all package.json files
- Runs Python sync script to update `apps/api/pyproject.toml`
- Generates a comprehensive changelog

#### Step 2: Publish Release
```bash
pnpm release
```
This publishes all packages and creates a GitHub release.

### Automated Releases

GitHub Actions will:
1. **Create Release PRs** when changesets exist
2. **Publish automatically** when the release PR is merged
3. **Update all packages** including the Python API

## Version Impact Guidelines

| Change Type | Version Impact | Examples |
|-------------|----------------|----------|
| **Bug fixes** | `patch` | Fix authentication timeout, resolve UI bug |
| **New features** | `minor` | Add user profile upload, implement search |
| **Performance** | `minor` | Optimize database queries, improve load times |
| **Breaking changes** | `major` | Remove deprecated API, change function signatures |
| **Documentation** | `patch` | Update README, add API docs |
| **Dependencies** | `patch` | Update dependencies, security patches |

## Examples

### Adding a Bug Fix
```bash
# Make the fix
git commit -m "fix: resolve authentication timeout"

# Add changeset
pnpm changeset add
# → Select affected packages
# → Summary: "Fix authentication timeout issue"
# → Version impact: patch
```

### Adding a New Feature
```bash
# Implement feature
git commit -m "feat: add user profile upload"

# Add changeset
pnpm changeset add
# → Select affected packages
# → Summary: "Add user profile upload functionality"
# → Version impact: minor
```

### Breaking Change
```bash
# Make breaking change
git commit -m "feat!: remove old authentication system"

# Add changeset
pnpm changeset add
# → Select affected packages
# → Summary: "Remove deprecated authentication system"
# → Version impact: major
```

## Package Management

### Included in Versioning:
- `@opencircle/core` - Core library
- `@opencircle/ui` - UI components
- `opencircle` (root) - Main package
- `api` (Python) - Python API (auto-synced)

### Excluded from Versioning:
- `admin` - Admin dashboard (private)
- `platform` - Platform app (private)

## Commands Reference

```bash
# Add a changeset for current changes
pnpm changeset add

# View pending changesets
pnpm changeset status

# Update all package versions
pnpm version-packages

# Publish all packages
pnpm release

# Check what would be released (dry run)
pnpm changeset version --snapshot
```

## Tips

- **Add changesets immediately** after making changes
- **Be descriptive** in changeset summaries - this becomes your changelog
- **Batch changes** - accumulate multiple changesets before releasing
- **Check the PR** - GitHub creates a release PR showing all changes
- **Python sync is automatic** - no need to manually update pyproject.toml

## Troubleshooting

### Changeset not found?
```bash
pnpm changeset status
# Shows pending changesets
```

### Version out of sync?
```bash
python scripts/sync-python-version.py
# Manually sync Python version with root package.json
```

### Need to modify a changeset?
Edit the `.changeset/[name].md` file directly.

## Migration from Semantic Release

- **No more strict commit messages** - use conventional commits for clarity, but not required
- **Manual release control** - you decide when to release
- **Better monorepo support** - Changesets handles complex dependencies better
- **Clearer changelogs** - Human-written summaries vs auto-generated from commits
