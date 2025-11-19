#!/bin/bash
# Tally Session Wrap Helper
# Usage: ./session-wrap.sh

set -e

echo "📊 Wrapping current session..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find latest session
LATEST_SESSION=$(ls -t .session/sessions/*.md 2>/dev/null | head -1)

if [ -z "$LATEST_SESSION" ]; then
    echo "❌ No session files found in .session/sessions/"
    exit 1
fi

SESSION_NAME=$(basename "$LATEST_SESSION" .md)
echo "📝 Current session: $SESSION_NAME"
echo ""

# Extract session info
echo "📋 Session Summary:"
echo ""
grep -A 10 "## Goals" "$LATEST_SESSION" || echo "  No goals found"
echo ""

# Check git status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📂 Git Status:"
echo ""
git status -s
echo ""

# Count changes
CHANGED_FILES=$(git status -s | wc -l)
echo "📊 Files changed: $CHANGED_FILES"
echo ""

# Prompt for synthesis
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Next steps:"
echo "   1. Review session file: $LATEST_SESSION"
echo "   2. Update .session/CONTEXT.md with new state"
echo "   3. Add entry to .session/INDEX.md"
echo "   4. Commit changes with session notes"
echo ""
echo "🤖 Ask Claude to help with synthesis:"
echo "   'Please wrap this session and update CONTEXT.md and INDEX.md'"
echo ""
echo "✅ Or manually commit:"
echo "   git add .session/"
echo "   git commit -m \"Session: $SESSION_NAME\""
echo ""
