#!/usr/bin/env python3
"""
Script to sync Python package version with Changesets version.
This script reads the version from root package.json and updates pyproject.toml.
"""

import json
import sys
import toml
from pathlib import Path


def get_root_version():
    """Get version from root package.json"""
    root_path = Path(__file__).parent.parent / "package.json"
    with open(root_path, "r") as f:
        package_data = json.load(f)
    return package_data["version"]


def update_python_version(new_version):
    """Update version in pyproject.toml"""
    pyproject_path = Path(__file__).parent.parent / "apps" / "api" / "pyproject.toml"

    if not pyproject_path.exists():
        print(f"❌ pyproject.toml not found at {pyproject_path}")
        return False

    # Read current pyproject.toml
    with open(pyproject_path, "r") as f:
        pyproject_data = toml.load(f)

    old_version = pyproject_data["project"]["version"]
    pyproject_data["project"]["version"] = new_version

    # Write updated pyproject.toml
    with open(pyproject_path, "w") as f:
        toml.dump(pyproject_data, f)

    print(f"✅ Updated Python version: {old_version} → {new_version}")
    return True


def main():
    """Main sync function"""
    try:
        # Get version from root package.json
        new_version = get_root_version()
        print(f"📦 Root version: {new_version}")

        # Update Python version
        if update_python_version(new_version):
            print("🎉 Python version sync completed successfully!")
            return 0
        else:
            print("❌ Failed to update Python version")
            return 1

    except Exception as e:
        print(f"❌ Error syncing Python version: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
