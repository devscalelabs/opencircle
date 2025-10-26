# Release Guide

## Simple Release Process

This project uses a **manual release system**. No automatic PRs, no complexity.

### When You Want to Release

Go to **GitHub Actions → Release workflow** and click "Run workflow":

1. **Choose version type:**
   - `patch` (0.1.0 → 0.1.1) - Bug fixes
   - `minor` (0.1.0 → 0.2.0) - New features
   - `major` (0.1.0 → 1.0.0) - Breaking changes

2. **Click "Run workflow"**

That's it! The workflow will:
- Update all package versions
- Sync Python API version
- Create GitHub release
- Push changes and tags

### What Gets Updated

✅ `@opencircle/core` - Core library
✅ `@opencircle/ui` - UI components
✅ `opencircle` (root) - Main package
✅ `api` (Python) - Python API version

❌ `admin` - Admin dashboard (ignored)
❌ `platform` - Platform app (ignored)

### Daily Development

Just work normally:
```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push
# No automatic releases!
```

### Version Guidelines

| Change Type | Version | Examples |
|-------------|---------|----------|
| Bug fixes | `patch` | Fix login issue, resolve UI bug |
| New features | `minor` | Add user profile, implement search |
| Breaking changes | `major` | Remove old API, change function signatures |

### Commands (Optional)

If you want to test locally:
```bash
# Check current version
node -p "require('./package.json').version"

# Sync Python version manually
python scripts/sync-python-version.py
```

### That's It!

- **No automatic PRs** on every push
- **No changesets** to manage
- **Manual control** - you decide when to release
- **Simple workflow** - just click and choose version type

Push your code daily, release when you're ready. Simple.
