#!/bin/bash

# Fix Case Sensitivity Issues in Git Repository
# This script identifies and fixes case mismatches between Git index and filesystem

set -e

echo "🔍 Checking for case sensitivity issues..."

# Create temporary files
GIT_FILES="/tmp/git-files-$$.txt"
FS_FILES="/tmp/fs-files-$$.txt"
MISMATCHES="/tmp/mismatches-$$.txt"

# Get list of files from Git index
echo "📋 Getting files from Git index..."
git ls-files | grep -E "\.(tsx?|jsx?|py|md|json|yaml|yml)$" | sort > "$GIT_FILES"

# Get list of files from filesystem
echo "📁 Getting files from filesystem..."
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" -o -name "*.py" -o -name "*.md" -o -name "*.json" -o -name "*.yaml" -o -name "*.yml" \) | sed 's|^\./||' | sort > "$FS_FILES"

# Find case mismatches
echo "🔎 Finding case mismatches..."
diff "$GIT_FILES" "$FS_FILES" | grep -E "^[<>]" | grep -v "^\-\-\-" | grep -v "^[0-9,]*[0-9c][0-9,]*[0-9]$" > "$MISMATCHES" || true

if [ ! -s "$MISMATCHES" ]; then
    echo "✅ No case sensitivity issues found!"
    rm -f "$GIT_FILES" "$FS_FILES" "$MISMATCHES"
    exit 0
fi

echo "⚠️  Found case sensitivity issues:"
cat "$MISMATCHES"

# Create fix commands
echo "🔧 Creating fix commands..."
FIX_SCRIPT="/tmp/fix-case-$$.sh"
echo "#!/bin/bash" > "$FIX_SCRIPT"
echo "set -e" >> "$FIX_SCRIPT"

while IFS= read -r line; do
    if [[ $line =~ ^\<\ (.*)$ ]]; then
        # File exists in Git but not in filesystem (wrong case)
        git_path="${BASH_REMATCH[1]}"
        # Find the actual filesystem path
        fs_path=$(find . -iname "$(basename "$git_path")" -type f | sed 's|^\./||' | head -1)
        if [ -n "$fs_path" ] && [ "$git_path" != "$fs_path" ]; then
            echo "echo 'Fixing: $git_path -> $fs_path'" >> "$FIX_SCRIPT"
            echo "git mv \"$git_path\" \"$git_path.tmp\" 2>/dev/null || true" >> "$FIX_SCRIPT"
            echo "git mv \"$git_path.tmp\" \"$fs_path\" 2>/dev/null || true" >> "$FIX_SCRIPT"
        fi
    elif [[ $line =~ ^\>\ (.*)$ ]]; then
        # File exists in filesystem but not in Git (missing from index)
        fs_path="${BASH_REMATCH[1]}"
        echo "echo 'Adding to Git: $fs_path'" >> "$FIX_SCRIPT"
        echo "git add \"$fs_path\"" >> "$FIX_SCRIPT"
    fi
done < "$MISMATCHES"

chmod +x "$FIX_SCRIPT"

echo "📝 Fix script created at: $FIX_SCRIPT"
echo "🚀 Run the fix script? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "🔧 Applying fixes..."
    bash "$FIX_SCRIPT"

    echo "📊 Checking Git status after fixes..."
    git status

    echo "💡 If there are still issues, you may need to:"
    echo "   1. Set core.ignorecase=false: git config core.ignorecase false"
    echo "   2. Remove and re-add problematic files"
    echo "   3. Commit the changes"
fi

# Cleanup
rm -f "$GIT_FILES" "$FS_FILES" "$MISMATCHES" "$FIX_SCRIPT"

echo "✅ Case sensitivity fix complete!"
