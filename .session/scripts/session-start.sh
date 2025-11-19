#!/bin/bash
# Tally Session Start Helper
# Usage: ./session-start.sh "topic-name"

set -e

TOPIC=$1
if [ -z "$TOPIC" ]; then
    echo "❌ Usage: ./session-start.sh <topic>"
    echo "   Example: ./session-start.sh tag-management-ui"
    exit 1
fi

DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
BRANCH=$(git branch --show-current)

echo "🚀 Starting new session: $TOPIC"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Display context
echo "📋 Loading project context..."
echo ""
cat .session/CONTEXT.md | head -50
echo ""
echo "... (see .session/CONTEXT.md for full context)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show last session
LAST_SESSION=$(ls -t .session/sessions/*.md 2>/dev/null | head -1)
if [ -n "$LAST_SESSION" ]; then
    echo "📖 Last session: $(basename $LAST_SESSION .md)"
    echo ""
fi

# Create session file
SESSION_FILE=".session/sessions/${DATE}-${TOPIC}.md"

cat > "$SESSION_FILE" << EOF
# Session: ${DATE} - ${TOPIC}

**Started:** ${TIME}
**Branch:** ${BRANCH}
**Status:** 🚧 In Progress

---

## Goals

- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

---

## Context Loaded

- ✅ CONTEXT.md reviewed
- ✅ ARCHITECTURE.md reviewed
- ✅ Last session: $(basename $LAST_SESSION .md 2>/dev/null || echo "None")

---

## Work Log

### ${TIME} - Session Start
- Reviewed project context
- Current state: [describe from CONTEXT.md]
- Goals identified: [list goals]

---

## Decisions Made

*Record technical decisions as they happen*

### Decision: [Title]
**Rationale:** Why we chose this approach
**Alternatives:** What we considered
**Tradeoff:** What we're giving up
**Impact:** How this affects the system

---

## Code Changes

*Track file modifications with reasoning*

- \`path/to/file.ts\` - [NEW/modified] - [Why changed]

---

## Learnings

*Capture insights as you discover them*

1. **Learning 1:** [Description]
   - Context: [When/where this applies]
   - Application: [How to use this knowledge]

---

## Issues Encountered

*Problems and their solutions*

### Issue: [Description]
- **Symptom:** What went wrong
- **Cause:** Why it happened
- **Solution:** How we fixed it
- **Prevention:** How to avoid in future
- **File:** Where the fix is

---

## Next Steps

*For next session*

1. Priority 1
2. Priority 2
3. Priority 3

---

**Session End:** [Not wrapped yet]
**Duration:** [TBD]
**Status:** 🚧 In Progress
EOF

echo "✅ Session file created: $SESSION_FILE"
echo ""
echo "📌 Ready to work on: $TOPIC"
echo "📝 Session notes will be saved to: $SESSION_FILE"
echo ""
echo "💡 Tip: Update the session file as you work!"
echo "🎯 When done, run: ./session-wrap.sh"
