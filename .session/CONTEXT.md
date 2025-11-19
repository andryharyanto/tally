# Tally - Current Project Context

**Last Updated:** 2025-11-19
**Current Sprint:** Auto-naming and Learning System - COMPLETE
**Active Branch:** main (feature branch merged)
**Status:** ✅ Production Ready

---

## System Status

### ✅ Complete Features
- **LLM Message Parser:** Nuanced understanding with confidence scoring
  - Distinguishes tasks/comments/questions/observations
  - Context-aware with recent messages and active tasks
  - Threshold: 0.6 confidence for task creation

- **Auto-Naming System:** Workflow-specific IDs and contextual titles
  - Invoice: INV-0001, INV-0002, etc.
  - Payment: PAY-0001, PAY-0002, etc.
  - Monthly Close: CLOSE-0001, CLOSE-0002, etc.
  - Enhances with metadata (customer, amount, invoice number)

- **Month Tags (YYYY-MM):** Temporal filtering for finance workflows
  - Extracts from metadata, title, or due date
  - Format: #2025-10, #2025-11, #2025-12
  - Supports month names, abbreviations, numbers

- **Chat-Based Rename/Retag:** Natural language task management
  - "rename the Humana invoice to Humana Q4 Invoice"
  - "tag the TechCorp payment as urgent"

- **Learning System:** Foundation for ML improvements
  - Records all user corrections (title and tags)
  - Stores workflow context for pattern recognition
  - Ready for ML-based naming enhancements

- **Magic Filter:** Task-specific chat views
  - Click task to filter related messages
  - Visual indicators with cyan glow
  - Bidirectional state sync

- **Error Handling:** Robust operation
  - Learning failures don't break core features
  - Try-catch blocks on all enhancement features
  - Fallback chains for data extraction

### 🚧 In Progress
- None (last session completed)

### ❌ Not Started
- **Tag Management UI:** Tag filter dropdown, tag editor, bulk operations
- **Learning Application:** Using stored patterns to improve naming
- **Bulk Operations:** Rename/retag multiple tasks at once
- **Tag Analytics:** Most common tags, usage over time

---

## Recent Changes (Last 3 Sessions)

### 2025-11-19 - Auto-Naming & Month Tags (LATEST)
**Duration:** 3 hours | **Status:** ✅ Complete | **PR:** Merged to main

**What We Built:**
- TaskNamingService with workflow-specific naming
- Month tag extraction (YYYY-MM format)
- Error handling for learning system
- Chat-based rename/retag commands
- Learning database schema

**Key Files:**
- `/server/src/services/TaskNamingService.ts` - NEW
- `/server/src/models/TaskNameLearning.ts` - NEW
- `/server/src/models/database.ts` - Added task_name_corrections table
- `/server/src/services/TaskService.ts` - Integrated naming service
- `/client/src/components/TaskBoard.tsx` - Display tags

**Commits:**
1. Add intelligent auto-naming, auto-tagging, and learning system
2. Add error handling to TaskNamingService
3. Add YYYY-MM month tags for temporal filtering
4. Update PR description
5. Add comprehensive session notes

### 2025-11-18 - Magic Filter (Previous)
**What:** Click tasks to filter related chat messages
**Impact:** Better task-specific conversations

### 2025-11-17 - LLM Parser Enhancement (Earlier)
**What:** Nuanced understanding with message type classification
**Impact:** No false task creation from vague messages

---

## Known Issues

### Low Priority
1. **Task ID Counters Reset on Restart**
   - Issue: In-memory Map gets cleared
   - Impact: IDs restart from 0001
   - Solution: Persist in database or derive from COUNT
   - Workaround: Use full task IDs for reference

### Medium Priority
2. **No Tag Discovery**
   - Issue: Users don't know what tags exist
   - Impact: Can't explore or filter by available tags
   - Solution: Build tag management UI (next sprint)

3. **Relative Dates Not Parsed**
   - Issue: "Next month" doesn't generate month tags
   - Impact: Some temporal tasks miss tags
   - Solution: Integrate chrono-node for relative parsing

---

## Environment

### Configuration
- **API Key:** ✅ Configured in `/server/.env`
- **Database:** SQLite at `/server/data/tally.db`
- **Server Port:** 3001
- **Client Port:** 3000

### Git
- **Main Branch:** main
- **Last Feature Branch:** claude/conversational-task-tracker-01M6pnxGHQTwEpqRg1yRMvf9 (merged)
- **Merged PRs:** 1
- **Total Commits:** 10+

### Dependencies
- **Claude API:** Anthropic SDK (required for LLM parsing)
- **Frontend:** React 18, TypeScript, Vite, TailwindCSS
- **Backend:** Node.js, Express, Socket.io
- **Database:** better-sqlite3

---

## Next Priorities

### Sprint 1: Tag Management (Not Started)
1. **Tag Filter Dropdown**
   - Show all available tags
   - Multi-select filtering
   - Tag count badges

2. **Tag Editor UI**
   - Modal for bulk tag operations
   - Add/remove tags from multiple tasks
   - Tag suggestions based on similar tasks

3. **Tag Analytics**
   - Most common tags
   - Tag usage over time
   - Tag co-occurrence

### Sprint 2: Learning Application (After Sprint 1)
1. **Apply Learning Patterns**
   - Use stored corrections to improve naming
   - Suggest tags based on past usage
   - Workflow-specific learning models

2. **Bulk Operations**
   - "Tag all October invoices as Q4"
   - Rename multiple tasks with pattern
   - Batch retag operations

---

## Quick Commands

### Start Development
```bash
# Terminal 1 - Server
cd /home/user/tally/server
npm run dev

# Terminal 2 - Client
cd /home/user/tally/client
npm run dev
```

### Build for Production
```bash
cd /home/user/tally/server && npm run build
cd /home/user/tally/client && npm run build
```

### Database Location
```bash
/home/user/tally/server/data/tally.db
```

### View Logs
```bash
# Server logs show:
# - LLM parse results
# - Auto-naming output
# - Error handling triggers
```

---

## Key Patterns to Maintain

### 1. Error Handling (3 Levels)
```typescript
// Critical: Must succeed
if (!result) throw new Error('Critical failure');

// Enhancement: Try-catch with fallback
try {
  const enhanced = enhancementFeature();
} catch (error) {
  console.error('Enhancement failed:', error);
  return fallbackValue;
}

// Nice-to-have: Best effort
analytics?.track('event').catch(() => {});
```

### 2. Service Layer Pattern
```
Routes → Services → Models → Database
```
- Routes handle HTTP
- Services contain business logic
- Models handle data access
- Keep routes thin!

### 3. Tag Deduplication
```typescript
tags: [...new Set(tags)]  // Always deduplicate
```

### 4. Month Tag Format
```typescript
// YYYY-MM format only
const monthTag = `${year}-${String(month).padStart(2, '0')}`;
```

### 5. Fallback Chains
```typescript
const value =
  metadata.field ||
  parseFromTitle(title) ||
  parseFromDate(date) ||
  defaultValue;
```

---

## Architecture Quick Reference

### Frontend Components
- `App.tsx` - Root with state management
- `ChatInterface.tsx` - Message input and display
- `TaskBoard.tsx` - Task display with filtering
- `UserSelector.tsx` - User switching

### Backend Services
- `TaskService.ts` - Task orchestration
- `TaskNamingService.ts` - Auto-naming and tagging
- `WorkflowService.ts` - Workflow management

### Database Models
- `Task.ts` - Task CRUD with tags
- `Message.ts` - Message storage
- `TaskNameLearning.ts` - Learning data
- `User.ts` - User accounts
- `Workflow.ts` - Workflow definitions

### Key Files
- `/server/src/parsers/LLMMessageParser.ts` - NLP parsing
- `/server/src/models/database.ts` - Schema definitions
- `/shared/types.ts` - TypeScript interfaces

---

## Testing Checklist

### Before Each Session
- [ ] Server starts without errors
- [ ] Client connects to server
- [ ] Can send chat messages
- [ ] Tasks auto-created with proper IDs
- [ ] Month tags appear correctly
- [ ] Error handling works (try without API key)

### After Each Change
- [ ] TypeScript compiles (server + client)
- [ ] No console errors
- [ ] Tags deduplicated
- [ ] Learning system doesn't break core features

---

**Last Session:** 2025-11-19 (Auto-naming system complete)
**Next Session:** Tag Management UI
**Status:** Ready for new development
