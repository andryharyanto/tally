# Tally - Session Management System

## Overview

This system ensures context continuity across development sessions by providing structured note-taking, automatic context loading, and systematic knowledge synthesis.

---

## File Structure

```
/home/user/tally/
├── .session/
│   ├── INDEX.md                    # Master index of all sessions
│   ├── CONTEXT.md                  # Current project context (always read first)
│   ├── ARCHITECTURE.md             # System architecture reference
│   ├── sessions/
│   │   ├── 2025-11-19-auto-naming.md
│   │   ├── 2025-11-20-tag-ui.md
│   │   └── ...
│   ├── templates/
│   │   ├── session-start.md
│   │   └── session-end.md
│   └── scripts/
│       ├── start-session.sh
│       └── wrap-session.sh
└── SESSION_NOTES.md                # Legacy - kept for reference
```

---

## Session Lifecycle

### Phase 1: Session Start (5 minutes)

**User Command:**
```
"Start new session on [topic/feature]"
```

**Claude Actions:**
1. Read `.session/CONTEXT.md` (current state)
2. Read `.session/INDEX.md` (session history)
3. Read `.session/ARCHITECTURE.md` (system overview)
4. Read last 2 session files for continuity
5. Create new session file from template
6. Confirm context loaded

**Output:**
```
✅ Context loaded from CONTEXT.md
✅ Architecture reviewed
✅ Last session: 2025-11-19 (Auto-naming system)
📋 Current focus: [topic]
🎯 Ready to begin!
```

### Phase 2: Development (Active Session)

**During Development:**
- Claude maintains running notes in current session file
- Updates ARCHITECTURE.md if system design changes
- Records decisions, learnings, issues in real-time

**Session File Structure:**
```markdown
# Session: [Date] - [Topic]

## Goals
- [ ] Primary goal
- [ ] Secondary goal

## Work Log
[Timestamped entries as work progresses]

## Decisions Made
[Key technical decisions with rationale]

## Code Changes
[Files modified and why]

## Learnings
[Insights gained]

## Issues Encountered
[Problems and solutions]

## Next Steps
[What to do next session]
```

### Phase 3: Session Wrap (5 minutes)

**User Command:**
```
"Wrap session"
```

**Claude Actions:**
1. Review current session file
2. Synthesize learnings into `.session/CONTEXT.md`
3. Update `.session/INDEX.md` with session summary
4. Update `.session/ARCHITECTURE.md` if needed
5. Create commit with session notes
6. Display session summary

**Output:**
```
📊 Session Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Completed: 3/3 goals
📝 Files changed: 7
🧠 Learnings: 5 key insights
⚠️  Issues: 2 (both resolved)
🔄 Updated: CONTEXT.md, INDEX.md, ARCHITECTURE.md
📌 Next session: [top priority items]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Core Files Explained

### 1. `.session/CONTEXT.md` - The Living Brain

**Purpose:** Single source of truth for current project state

**Contents:**
```markdown
# Tally - Current Context

**Last Updated:** 2025-11-19
**Current Sprint:** Auto-naming and Learning System
**Active Branch:** claude/conversational-task-tracker-01M6pnxGHQTwEpqRg1yRMvf9

## System Status
- ✅ LLM Parser: Working with error handling
- ✅ Auto-naming: Production ready
- ✅ Month tags: Implemented YYYY-MM format
- 🚧 Learning system: Data collection only (not applied yet)
- ❌ Tag UI: Not started

## Recent Changes (Last 3 Sessions)
1. **2025-11-19:** Added month tags, error handling
2. **2025-11-18:** Implemented auto-naming service
3. **2025-11-17:** Created magic filter

## Known Issues
1. Task ID counters reset on restart (low priority)
2. No tag management UI (next sprint)

## Environment
- API Key: ✅ Configured
- Database: SQLite at /server/data/tally.db
- Server: Port 3001
- Client: Port 3000

## Next Priorities
1. Apply learning patterns to naming
2. Build tag management UI
3. Add bulk operations
```

**Update Frequency:** Every session wrap

### 2. `.session/INDEX.md` - Session History

**Purpose:** Quick reference to all sessions

**Contents:**
```markdown
# Session Index

## Active Development (2025-11)

### 2025-11-19 - Auto-Naming & Month Tags
- **Duration:** 3 hours
- **Goals:** Auto-naming system, YYYY-MM tags, error handling
- **Status:** ✅ Complete
- **Files:** TaskNamingService.ts, database.ts, Task.ts
- **PR:** Merged to main
- **Key Learnings:** Error handling is critical, month parsing needs fallbacks
- **File:** sessions/2025-11-19-auto-naming.md

### 2025-11-18 - LLM Parser Enhancement
- **Duration:** 2 hours
- **Goals:** Nuanced message understanding
- **Status:** ✅ Complete
- **Key Learnings:** Confidence scoring prevents false task creation
- **File:** sessions/2025-11-18-llm-parser.md

## Archived Sessions (2025-10)
[Older sessions...]

## Session Stats
- Total Sessions: 15
- Total Hours: ~40
- Features Completed: 12
- Active Issues: 3
```

**Update Frequency:** Every session wrap

### 3. `.session/ARCHITECTURE.md` - System Design

**Purpose:** High-level architecture reference (changes slowly)

**Contents:**
```markdown
# Tally - System Architecture

## Tech Stack
- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express + Socket.io
- **Database:** SQLite (better-sqlite3)
- **LLM:** Anthropic Claude (Sonnet)

## Architecture Layers

### Client (Port 3000)
```
UI Components
    ↓
Services (api.ts, socket hooks)
    ↓
WebSocket + REST API
```

### Server (Port 3001)
```
Routes (Express)
    ↓
Services (Business Logic)
    ↓
Models (Data Access)
    ↓
Database (SQLite)
```

## Key Services

### TaskNamingService
- Auto-generates workflow IDs (INV-0001, etc.)
- Extracts month tags (YYYY-MM)
- Handles learning corrections
- **Critical:** Error handling for all DB calls

### LLMMessageParser
- Parses natural language into structured tasks
- Confidence scoring (0.0-1.0, threshold 0.6)
- Message classification (task/comment/question/observation)
- **Dependencies:** ANTHROPIC_API_KEY required

### TaskService
- Orchestrates task CRUD
- Calls TaskNamingService for enhancements
- Links messages to tasks
- **Pattern:** Always use try-catch for enhancement features

## Database Schema

### tables
1. **tasks** - Task records with tags
2. **messages** - Chat messages with parsed data
3. **users** - User accounts
4. **workflows** - Workflow definitions
5. **task_name_corrections** - Learning data

## Design Patterns

### Service Layer
- Routes → Services → Models
- Services contain business logic
- Models handle DB operations

### Error Handling (3 Levels)
1. **Critical:** Throw errors (task creation)
2. **Enhancement:** Try-catch with fallback (learning)
3. **Nice-to-have:** Best effort (analytics)

### Tag System
- Stored as JSON array in TEXT column
- Auto-generated + user-defined
- Deduplication with `[...new Set(tags)]`

## API Endpoints

### Tasks
- GET /api/tasks - List all
- GET /api/tasks/:id - Get one
- PATCH /api/tasks/:id/rename - Rename
- PATCH /api/tasks/:id/retag - Update tags
- DELETE /api/tasks/:id - Delete

### Messages
- POST /api/messages - Send message (creates tasks)
- GET /api/messages - List recent

## WebSocket Events
- message:new - New message broadcast
- task:updated - Task changed

## Critical Files
- `/server/src/services/TaskNamingService.ts` - Naming logic
- `/server/src/parsers/LLMMessageParser.ts` - NLP parsing
- `/server/src/services/TaskService.ts` - Task orchestration
- `/server/src/models/database.ts` - Schema definitions

## Environment Variables
- ANTHROPIC_API_KEY - Required for LLM parsing
- PORT - Server port (default 3001)
- CLIENT_URL - CORS origin (default http://localhost:3000)
```

**Update Frequency:** Major changes only

---

## Session Templates

### Start Template (`.session/templates/session-start.md`)

```markdown
# Session: [DATE] - [TOPIC]

**Started:** [TIME]
**Goals:**
- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

**Context Loaded:**
- ✅ CONTEXT.md reviewed
- ✅ Last session: [session-id]
- ✅ Architecture: [version]

**Branch:** [branch-name]

---

## Work Log

### [TIME] - Session Start
- Reviewed project context
- Identified goals: [list]

---

## Decisions Made

[Add decisions as they happen]

---

## Code Changes

[Track file modifications]

---

## Learnings

[Capture insights]

---

## Issues Encountered

[Problems and solutions]

---

## Next Steps

[For next session]
```

### End Template (`.session/templates/session-end.md`)

```markdown
# Session Synthesis Template

## What We Built
1. [Feature/change 1]
2. [Feature/change 2]

## Why We Built It
- **Problem:** [description]
- **Solution:** [approach]
- **Impact:** [benefit]

## Technical Decisions
1. **Decision:** [what]
   - **Rationale:** [why]
   - **Tradeoff:** [cost]

## Key Learnings
1. [Learning 1]
2. [Learning 2]

## Architecture Changes
- [Change 1]
- [Change 2]

## Files Modified
- [file 1] - [reason]
- [file 2] - [reason]

## Testing Notes
- [What was tested]
- [What needs testing]

## Known Issues
- [Issue 1]
- [Issue 2]

## Next Session Priorities
1. [Priority 1]
2. [Priority 2]

## Context Updates
- [Update to CONTEXT.md]
- [Update to ARCHITECTURE.md]
```

---

## Automation Scripts

### Start Script (`.session/scripts/start-session.sh`)

```bash
#!/bin/bash

# Tally Session Start Script

DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
TOPIC=$1

if [ -z "$TOPIC" ]; then
    echo "Usage: ./start-session.sh <topic>"
    exit 1
fi

# Create session file
SESSION_FILE=".session/sessions/${DATE}-${TOPIC}.md"
cp .session/templates/session-start.md "$SESSION_FILE"

# Replace placeholders
sed -i "s/\[DATE\]/${DATE}/g" "$SESSION_FILE"
sed -i "s/\[TIME\]/${TIME}/g" "$SESSION_FILE"
sed -i "s/\[TOPIC\]/${TOPIC}/g" "$SESSION_FILE"

echo "✅ Session file created: $SESSION_FILE"
echo ""
echo "📋 Reading context files..."
echo ""

# Display key context
cat .session/CONTEXT.md

echo ""
echo "🎯 Session started! File: $SESSION_FILE"
```

### Wrap Script (`.session/scripts/wrap-session.sh`)

```bash
#!/bin/bash

# Tally Session Wrap Script

DATE=$(date +%Y-%m-%d)
LATEST_SESSION=$(ls -t .session/sessions/*.md | head -1)

echo "📊 Wrapping session: $LATEST_SESSION"
echo ""

# Show session summary
echo "Session Goals:"
grep -A 5 "Goals:" "$LATEST_SESSION"

echo ""
echo "Work Completed:"
grep -A 10 "Work Log" "$LATEST_SESSION"

echo ""
echo "💡 Next steps:"
echo "1. Review and update .session/CONTEXT.md"
echo "2. Add entry to .session/INDEX.md"
echo "3. Commit session notes"
echo ""
echo "Ready to synthesize? (y/n)"
```

---

## Usage Guide

### Starting a New Session

**Manual:**
```
1. Read .session/CONTEXT.md
2. Read .session/INDEX.md
3. Read .session/ARCHITECTURE.md
4. Create new session file from template
5. Begin work
```

**Automated (preferred):**
```bash
cd /home/user/tally
./.session/scripts/start-session.sh "tag-management-ui"
```

**In Claude Code:**
```
User: "Start new session on tag management UI"

Claude:
1. Reads CONTEXT.md, INDEX.md, ARCHITECTURE.md
2. Reviews last 2 sessions
3. Creates session file
4. Confirms: "✅ Context loaded. Ready to work on tag management UI!"
```

### During Development

**Claude maintains running notes:**
- Logs work as it happens
- Records decisions with rationale
- Captures learnings in real-time
- Updates session file continuously

**User doesn't need to do anything!**

### Wrapping a Session

**Manual:**
```
1. Review current session file
2. Synthesize to CONTEXT.md
3. Update INDEX.md
4. Commit all changes
```

**Automated (preferred):**
```bash
./.session/scripts/wrap-session.sh
```

**In Claude Code:**
```
User: "Wrap session"

Claude:
1. Reviews session work log
2. Synthesizes learnings
3. Updates CONTEXT.md with new state
4. Adds entry to INDEX.md
5. Creates commit with session notes
6. Shows summary and next steps
```

---

## Context Preservation Strategies

### 1. **Hierarchical Context**

```
CONTEXT.md (What's current)
    ↓
INDEX.md (What happened)
    ↓
ARCHITECTURE.md (How it works)
    ↓
Individual Sessions (Detailed history)
```

**Read in this order at session start!**

### 2. **Progressive Detail**

- **CONTEXT.md:** High-level, always current (1-2 pages)
- **INDEX.md:** Medium detail, chronological (5-10 pages)
- **Sessions:** Full detail, specific (unlimited)

**Principle:** Start broad, drill down as needed

### 3. **Temporal Organization**

Sessions organized by date:
```
sessions/
  2025-11/
    2025-11-19-auto-naming.md
    2025-11-20-tag-ui.md
  2025-10/
    [older sessions]
```

**Benefit:** Easy to find recent work

### 4. **Topic Tags in INDEX**

Each session has tags:
```markdown
### 2025-11-19 - Auto-Naming System
**Tags:** #naming #tags #error-handling #learning
```

**Benefit:** Find sessions by topic

### 5. **Living Architecture**

ARCHITECTURE.md changes slowly but stays current:
- Update only when design changes
- Reference from sessions: "See ARCHITECTURE.md#tag-system"
- Version controlled for history

### 6. **Commit Messages as Breadcrumbs**

Every session creates commits:
```
git commit -m "Session: Auto-naming system with month tags

- Added TaskNamingService with YYYY-MM extraction
- Implemented error handling for learning system
- Updated architecture for tag storage

See: .session/sessions/2025-11-19-auto-naming.md"
```

**Benefit:** Git history tracks development narrative

---

## Anti-Patterns to Avoid

### ❌ Don't:

1. **Keep everything in one file**
   - Becomes overwhelming
   - Hard to find specific info
   - Lost context in huge files

2. **Make Claude guess context**
   - Always provide CONTEXT.md
   - Don't assume Claude remembers

3. **Skip session wraps**
   - Learnings get lost
   - Context becomes stale
   - Future Claude confused

4. **Over-document**
   - Keep CONTEXT.md concise
   - Detail goes in session files
   - Archive old sessions

5. **Ignore ARCHITECTURE.md**
   - System design changes need updating
   - Future Claude makes wrong assumptions

### ✅ Do:

1. **Start every session with context read**
2. **Wrap every session with synthesis**
3. **Keep CONTEXT.md under 3 pages**
4. **Use templates consistently**
5. **Commit session notes with code**

---

## Example Workflow

### Session Start

```
User: "Start new session on tag management UI"

Claude reads:
1. .session/CONTEXT.md
   - Sees current state: learning system collecting data
   - Sees next priority: tag management UI
   - Sees environment: API key configured

2. .session/INDEX.md
   - Last session: 2025-11-19 (auto-naming)
   - Total sessions: 15
   - Active issues: 3

3. .session/ARCHITECTURE.md
   - Reviews tag system design
   - Understands service layer pattern
   - Notes error handling levels

4. Last session file
   - Reads 2025-11-19-auto-naming.md
   - Sees what was just completed
   - Understands current branch

Claude responds:
"✅ Context loaded!

**Current State:**
- Auto-naming system: Production ready
- Month tags: Implemented (YYYY-MM)
- Learning system: Collecting data only

**Last Session:** Added error handling to TaskNamingService

**Today's Goal:** Build tag management UI

**Approach:**
1. Create TagManager component
2. Add tag filter dropdown
3. Implement tag editor modal
4. Connect to existing tag system in TaskNamingService

Ready to begin?"
```

### During Session

```
Claude maintains session file:

## Work Log

### 10:30 - Created TagManager component
- Location: /client/src/components/TagManager.tsx
- Features: Tag list, filter, search
- Design: Palantir-style with purple theme

### 11:00 - Decision: Use Modal vs Inline Edit
- Chose modal for better UX
- Rationale: More space for bulk operations
- Tradeoff: Extra click, but cleaner UI

### 11:30 - Learning: Tag deduplication needed
- Issue: Users can add duplicate tags
- Solution: Use Set for deduplication
- Applied to both auto and manual tags

[Claude updates this in real-time as work progresses]
```

### Session Wrap

```
User: "Wrap session"

Claude:
1. Reviews session file
2. Synthesizes to CONTEXT.md:

```markdown
## System Status
- ✅ Tag Management UI: Complete with filter and editor
- ✅ Auto-naming: Production ready
...

## Recent Changes (Last 3 Sessions)
1. **2025-11-20:** Tag management UI with modal editor
2. **2025-11-19:** Added month tags, error handling
...
```

3. Updates INDEX.md:

```markdown
### 2025-11-20 - Tag Management UI
- **Duration:** 2 hours
- **Goals:** Tag filter, tag editor, tag search
- **Status:** ✅ Complete
- **Files:** TagManager.tsx, TaskBoard.tsx, api.ts
- **Tags:** #ui #tags #filtering
- **Key Learnings:** Modal pattern works better than inline
- **File:** sessions/2025-11-20-tag-ui.md
```

4. Creates commit:

```bash
git add .session/
git commit -m "Session: Tag management UI

- Built TagManager component with filter and search
- Added modal editor for bulk tag operations
- Implemented tag deduplication
- Updated tag display in TaskBoard

See: .session/sessions/2025-11-20-tag-ui.md"
```

5. Shows summary:

```
📊 Session Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Completed: 3/3 goals
📝 Files changed: 4
  - TagManager.tsx (new)
  - TaskBoard.tsx (modified)
  - api.ts (modified)
  - types.ts (modified)
🧠 Learnings: 3 key insights
  - Modal pattern > inline editing
  - Tag deduplication critical
  - Purple theme consistent with design
⚠️  Issues: 0
🔄 Updated: CONTEXT.md, INDEX.md
📌 Next session:
  1. Apply learning patterns to naming
  2. Add tag analytics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Benefits of This System

### For Claude Code

✅ **Instant Context:** Knows project state in 30 seconds
✅ **No Guessing:** Clear direction from CONTEXT.md
✅ **Pattern Continuity:** Follows established patterns from ARCHITECTURE.md
✅ **Learn from History:** Reviews past sessions for similar work
✅ **Consistent Quality:** Uses templates for structure

### For You (Developer)

✅ **No Context Loss:** Pick up exactly where you left off
✅ **Searchable History:** Find past decisions easily
✅ **Progress Tracking:** See how project evolved
✅ **Onboarding Tool:** New devs read CONTEXT.md and get up to speed
✅ **Documentation:** Session notes become project documentation

### For the Project

✅ **Institutional Knowledge:** Decisions and rationale preserved
✅ **Debugging Aid:** History of changes with reasoning
✅ **Refactoring Guide:** Understand why things are the way they are
✅ **Quality Assurance:** Patterns and standards documented
✅ **Future-Proof:** New Claude sessions work seamlessly

---

## Migration from Current Setup

### Step 1: Create Structure
```bash
mkdir -p .session/{sessions,templates,scripts}
```

### Step 2: Move Existing Notes
```bash
mv SESSION_NOTES.md .session/sessions/2025-11-19-auto-naming.md
```

### Step 3: Create Core Files
- Extract current state → CONTEXT.md
- Create session index → INDEX.md
- Document architecture → ARCHITECTURE.md

### Step 4: Add to .gitignore (Optional)
```
# Session notes (keep in repo for context preservation)
# .session/sessions/*.md  # Optional: ignore individual sessions
```

**Recommendation:** Keep session notes in repo for full history

---

## Quick Reference Card

### Every Session Start
1. ✅ Read CONTEXT.md
2. ✅ Read INDEX.md
3. ✅ Read ARCHITECTURE.md
4. ✅ Read last session
5. ✅ Create new session file

### During Session
- 📝 Update session file continuously
- 🎯 Record decisions with rationale
- 💡 Capture learnings as they happen

### Every Session End
1. ✅ Synthesize to CONTEXT.md
2. ✅ Update INDEX.md
3. ✅ Update ARCHITECTURE.md (if needed)
4. ✅ Commit session notes
5. ✅ Display summary

---

**Last Updated:** 2025-11-19
**Status:** Design Complete - Ready for Implementation
**Next:** Create initial structure and core files
