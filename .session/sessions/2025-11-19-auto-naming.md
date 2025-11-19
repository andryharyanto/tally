# Tally - Session Notes & Development Insights

## Session Overview (2025-11-19)

This document captures the development journey, technical decisions, and insights from building the conversational task tracker with LLM intelligence.

---

## What We Built

### 1. **Intelligent Auto-Naming & Auto-Tagging System**

**Problem Solved:**
- Tasks created from chat messages had generic, inconsistent names
- No standardized way to identify and organize tasks
- Missing temporal context for finance workflows

**Solution Implemented:**
- Created `TaskNamingService` as a translation layer
- Auto-generates workflow-specific IDs (INV-0001, PAY-0002, CLOSE-0003, etc.)
- Enhances titles with contextual metadata
  - Example: "Generate invoice" → "INV-0001: TechCorp Invoice $25,000"
- Auto-generates tags based on workflow type and metadata
  - `#invoice`, `#billing`, `#high-value`, `#techcorp`

**Key Files:**
- `/server/src/services/TaskNamingService.ts` - Core naming logic
- `/server/src/models/Task.ts` - Added tags field support
- `/server/src/models/database.ts` - Database schema with tags column

### 2. **Month-Based Temporal Filtering (YYYY-MM Tags)**

**Problem Solved:**
- Finance workflows are heavily time-based (monthly close, quarterly reviews)
- No easy way to filter tasks by month or period
- Needed consistent date format for aggregation

**Solution Implemented:**
- Smart month tag extraction from multiple sources:
  1. Metadata fields (`metadata.month`, `metadata.year`)
  2. Natural language in titles ("October 2025", "Nov 2025")
  3. Due dates (`metadata.dueDate`)
- Format: `YYYY-MM` (e.g., `#2025-10`, `#2025-11`)
- Handles month names, abbreviations, and numbers

**Example:**
```
"Humana Invoice October 2025"
→ Tags: #invoice, #billing, #humana, #2025-10
```

**Technical Implementation:**
- `extractMonthTag()` method with fallback logic
- Regex parsing for years: `/\b(20\d{2})\b/`
- Dictionary mapping for month names/abbreviations
- Date parsing for `dueDate` fields

### 3. **Chat-Based Rename/Retag Commands**

**Problem Solved:**
- No way to correct auto-generated names/tags without leaving chat interface
- Users should be able to refine task details conversationally

**Solution Implemented:**
- Extended LLM parser to support `rename` and `retag` actions
- Natural language commands:
  - "rename the Humana invoice to Humana Q4 Invoice"
  - "tag the TechCorp payment as urgent and high-value"
- API endpoints: `PATCH /tasks/:id/rename` and `PATCH /tasks/:id/retag`

**Key Code Changes:**
- Updated `ParsedTaskData` interface to include `rename` and `retag` actions
- Added `renameTask()` and `retagTask()` methods to `TaskService`
- Enhanced LLM parser prompt with rename/retag examples

### 4. **Learning System for Continuous Improvement**

**Problem Solved:**
- Auto-naming will have mistakes initially
- Need to improve naming over time based on user corrections
- Want to preserve institutional knowledge about naming conventions

**Solution Implemented:**
- Created `TaskNameLearningModel` to store corrections
- Database table: `task_name_corrections`
- Records:
  - Original title → Corrected title
  - Original tags → Corrected tags
  - Workflow type and user message for context
- Foundation for future ML-based improvements

**Data Captured:**
```typescript
{
  originalTitle: "Invoice",
  correctedTitle: "Humana Q4 Invoice",
  workflowType: "invoice-generation",
  originalTags: ["invoice"],
  correctedTags: ["invoice", "q4", "humana"],
  userMessage: "rename the invoice to Humana Q4 Invoice"
}
```

### 5. **Robust Error Handling**

**Problem Encountered:**
- Initial implementation crashed when learning database had issues
- "Failed to send message" errors in chat interface

**Solution Implemented:**
- Wrapped all learning system calls in try-catch blocks
- Made learning system failures non-blocking
- Core functionality (task creation, rename, retag) works even if learning fails
- Added TypeScript type safety for `learningPatterns` variable

**Locations:**
- `enhanceTaskName()` - wraps `getLearningPatterns()`
- `recordCorrection()` - wraps `TaskNameLearningModel.create()`
- `getSuggestions()` - wraps learning queries with empty array fallback

---

## Technical Decisions & Rationale

### 1. **Why Sequential Task IDs per Workflow?**

**Decision:** Use workflow-specific counters (INV-0001, INV-0002) instead of global IDs

**Rationale:**
- Finance teams often reference tasks by workflow type
- Sequential numbers within workflow make it easy to count tasks
- Human-friendly identifiers for verbal communication
- Follows industry patterns (invoice numbers, ticket systems)

**Tradeoff:** In-memory counter resets on server restart
**Future:** Persist counters in database or derive from task count

### 2. **Why YYYY-MM Format for Month Tags?**

**Decision:** Use `2025-10` instead of `October-2025` or `Oct-2025`

**Rationale:**
- Sortable: String sorting gives chronological order
- Unambiguous: No confusion between formats (10/11 vs 11/10)
- Compact: Shorter than full month names
- SQL-friendly: Matches SQL date format patterns
- Filterable: Easy to search/filter in UIs

### 3. **Why Fallback Chain for Month Extraction?**

**Decision:** Try metadata → title parsing → due date

**Rationale:**
- Metadata is most reliable (structured data)
- Title parsing catches conversational mentions
- Due date provides last resort for dated tasks
- Graceful degradation: get partial info when available

### 4. **Why Non-Blocking Learning System?**

**Decision:** Don't fail core operations if learning fails

**Rationale:**
- Learning is an enhancement, not a requirement
- Task creation/modification is critical path
- Better UX: users don't notice learning failures
- Fail-safe architecture: system remains functional

**Implementation Pattern:**
```typescript
try {
  learningOperation();
} catch (error) {
  console.error('Learning failed:', error);
  // Continue without learning
}
```

### 5. **Why Purple Tags in UI?**

**Decision:** Display tags with purple badges (`#tag-name`)

**Rationale:**
- Visual distinction from other metadata (cyan = workflow, amber = priority)
- Consistent with design system (Palantir-inspired)
- Hash symbol indicates "filterable/searchable"
- Stands out without overwhelming interface

---

## Key Learnings

### 1. **LLM Integration Requires Defensive Programming**

**Lesson:** External services (Claude API, databases) can fail unexpectedly

**Application:**
- Always wrap external calls in try-catch
- Provide fallback behavior for non-critical features
- Log errors for debugging but don't surface to users
- Test with missing API keys and database failures

### 2. **Natural Language Parsing Needs Multiple Attempts**

**Lesson:** Users will phrase things many different ways

**Examples of Month Variations:**
- "October 2025"
- "Oct 2025"
- "10/2025"
- "2025-10"
- "october"
- "10"

**Application:**
- Build flexible parsers with fallback logic
- Test with real user inputs, not just ideal cases
- Support abbreviations and variations
- Use dictionaries for mapping variants

### 3. **TypeScript Type Safety Prevents Runtime Errors**

**Issue Encountered:**
```typescript
let learningPatterns = { namingPatterns: [], taggingPatterns: [] };
// Type error: never[] is not assignable to string[]
```

**Solution:**
```typescript
let learningPatterns: { namingPatterns: string[]; taggingPatterns: string[] } = {
  namingPatterns: [],
  taggingPatterns: []
};
```

**Lesson:** Explicit type annotations prevent type inference issues

### 4. **Database Schema Migrations in SQLite**

**Approach Used:**
- Check if table/column exists in schema
- Use `CREATE TABLE IF NOT EXISTS`
- Use `DEFAULT` values for new columns on existing tables

**Key Pattern:**
```sql
CREATE TABLE IF NOT EXISTS tasks (
  -- existing columns
  tags TEXT DEFAULT '[]',  -- NEW column with default
  -- more columns
)
```

**Lesson:** SQLite doesn't have sophisticated migrations, so schema changes must be backward-compatible

### 5. **Month Tag Extraction Edge Cases**

**Discovered During Development:**
- "May" could be month or auxiliary verb (context-dependent)
- Year might be fiscal year (FY2025) vs calendar year (2025)
- Month might appear multiple times in title
- Date parsing can fail silently

**Solutions:**
- Use word boundaries in regex (`\b20\d{2}\b`)
- Prioritize metadata over title parsing
- Break early on first month match (don't over-match)
- Wrap date parsing in try-catch

---

## Architecture Insights

### 1. **Service Layer Pattern**

**Structure:**
```
Routes (Express) → Services (Business Logic) → Models (Data Access)
```

**Benefits:**
- Clean separation of concerns
- Services can be tested independently
- Models encapsulate database details
- Routes stay thin and focused

**Example:**
- `TaskService.createTask()` calls `TaskNamingService.enhanceTaskName()`
- `TaskNamingService` calls `TaskNameLearningModel.getLearningPatterns()`
- Each layer has single responsibility

### 2. **Learning System as Separate Concern**

**Decision:** Learning is orthogonal to core task management

**Benefits:**
- Can fail independently without breaking tasks
- Can be enhanced/replaced without touching core logic
- Easy to add ML/AI improvements later
- Keeps task service focused

### 3. **Tag System as Array of Strings**

**Schema:**
```sql
tags TEXT DEFAULT '[]'  -- JSON array stored as TEXT
```

**Rationale:**
- Simple and flexible
- No separate tags table needed (fewer joins)
- Easy to search with JSON functions
- Can add/remove tags without schema changes

**Tradeoff:** No tag normalization or referential integrity
**Future:** Could migrate to many-to-many if tag management becomes complex

### 4. **Error Handling Strategy**

**Levels:**
1. **Critical Path:** Must succeed (task creation, message processing)
   - Throw errors, handle at route level, return 500
2. **Enhancement Features:** Should succeed (learning, suggestions)
   - Try-catch with fallback, log error, continue
3. **Nice-to-Have:** Can fail silently (analytics, metrics)
   - Best-effort, no user impact if fails

---

## Code Patterns to Maintain

### 1. **Consistent Error Handling**

**Pattern:**
```typescript
try {
  const result = await enhancementFeature();
  return result;
} catch (error) {
  console.error('Enhancement failed:', error);
  return fallbackValue;
}
```

### 2. **Parse Result Interfaces**

**Pattern:**
```typescript
interface NamingResult {
  enhancedTitle: string;
  tags: string[];
  reasoning: string;  // Always explain the decision
}
```

### 3. **Fallback Chain**

**Pattern:**
```typescript
const value =
  metadata.field ||           // Try metadata
  parseFromTitle(title) ||    // Try title
  parseFromDate(date) ||      // Try date
  defaultValue;               // Fallback
```

### 4. **Tag Deduplication**

**Pattern:**
```typescript
tags: [...new Set(tags)]  // Remove duplicates
```

---

## Testing Scenarios for Future Sessions

### Critical Test Cases:

1. **Month Tag Extraction:**
   - [ ] "October 2025" → `#2025-10`
   - [ ] "Oct 2025" → `#2025-10`
   - [ ] "10/2025" → `#2025-10`
   - [ ] "Invoice for 10th month" → `#2025-10`
   - [ ] Metadata: `{month: "October", year: 2025}` → `#2025-10`
   - [ ] Due date: "2025-10-31" → `#2025-10`

2. **Error Handling:**
   - [ ] Send message without Anthropic API key (should fallback to deterministic parser)
   - [ ] Corrupted database (should continue task creation)
   - [ ] Invalid month name (should skip month tag gracefully)

3. **Rename/Retag Commands:**
   - [ ] "rename X to Y" → finds X, renames to Y
   - [ ] "tag X as urgent" → finds X, adds urgent tag
   - [ ] Ambiguous reference → asks for clarification

4. **Learning System:**
   - [ ] Correction recorded after rename
   - [ ] Suggestions based on past corrections
   - [ ] Learning database failure doesn't break tasks

---

## Known Issues & Future Work

### Current Limitations:

1. **Task ID Counters Reset on Restart**
   - In-memory Map gets cleared
   - Solution: Persist in database or derive from COUNT

2. **No Tag Management UI**
   - Can't see all available tags
   - Can't edit tags directly (only via chat)
   - Solution: Add tag filter dropdown, tag editor modal

3. **Month Tag Only for Explicit Dates**
   - "Next month" or "Q4" doesn't generate month tags
   - Solution: Use chrono-node for relative date parsing

4. **Learning System Not Yet Applied**
   - Corrections are stored but not used for suggestions
   - Solution: Implement ML-based naming using stored patterns

5. **No Bulk Operations**
   - Can't rename/retag multiple tasks at once
   - Solution: Add "tag all October invoices as Q4"

### Enhancement Ideas:

1. **Smart Tag Suggestions:**
   - Suggest tags based on similar tasks
   - Use learning data to recommend tags

2. **Tag Categories:**
   - Temporal: `#2025-10`
   - Workflow: `#invoice`
   - Status: `#urgent`, `#blocked`
   - Custom: user-defined

3. **Advanced Filtering:**
   - Multi-tag AND/OR queries
   - Date range filters
   - Tag autocomplete

4. **Tag Analytics:**
   - Most common tags
   - Tag usage over time
   - Tag co-occurrence patterns

---

## Git & Deployment Notes

### Branch Management:
- Feature branch: `claude/conversational-task-tracker-01M6pnxGHQTwEpqRg1yRMvf9`
- Merged to: `main`
- Status: **MERGED** ✅

### Key Commits:
1. `1d4a4b8` - Add LLM-powered message parsing
2. `b160b74` - Enhance LLM parser with nuanced understanding
3. `06d1866` - Add magic filter for task-specific views
4. `6c46d26` - Add intelligent auto-naming and auto-tagging
5. `9b487f9` - Add error handling to TaskNamingService
6. `4b4b783` - Add YYYY-MM month tags for temporal filtering
7. `02fa229` - Update PR description with new features

### Configuration Files Modified:
- `server/.env` - Added Anthropic API key (gitignored ✅)
- `server/tsconfig.json` - Include shared types directory
- `client/src/vite-env.d.ts` - Added for TypeScript support

### Database Changes:
- Added `tags` column to `tasks` table
- Added `task_name_corrections` table
- Added indexes for performance

---

## Quick Reference

### Starting the Application:

**Terminal 1 - Server:**
```bash
cd /home/user/tally/server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd /home/user/tally/client
npm run dev
```

### Environment Variables:
```bash
# /home/user/tally/server/.env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Building for Production:
```bash
# Server
cd server && npm run build

# Client
cd client && npm run build
```

### Key API Endpoints:
- `POST /api/messages` - Send chat message, creates tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `PATCH /api/tasks/:id/rename` - Rename task via chat
- `PATCH /api/tasks/:id/retag` - Retag task via chat
- `DELETE /api/tasks/:id` - Delete task

### Database Location:
```
/home/user/tally/server/data/tally.db
```

---

## Communication with Future Sessions

### If You Need to Debug:

1. **Check server logs** - All errors are console.error'd
2. **Inspect database** - Use SQLite browser on `server/data/tally.db`
3. **Test API directly** - Use curl/Postman to bypass UI
4. **Check .env file** - Ensure API key is present

### If Adding New Features:

1. **Follow service layer pattern** - Don't put logic in routes
2. **Add error handling** - Wrap external calls in try-catch
3. **Update types** - Keep `/shared/types.ts` in sync
4. **Test with and without API key** - Ensure fallbacks work
5. **Update this document** - Add your learnings here

### If Refactoring:

1. **Preserve public interfaces** - Services and models should stay stable
2. **Keep database schema backward-compatible** - Use migrations or defaults
3. **Don't break learning system** - It's already capturing data
4. **Test error paths** - Not just happy paths

---

## Success Metrics

### What Works Well:

✅ **Auto-naming with workflow IDs** - Clear, consistent task identification
✅ **Month tags (YYYY-MM)** - Easy filtering by time period
✅ **Error handling** - System stays up even when subsystems fail
✅ **Chat-based corrections** - Natural language task management
✅ **Learning foundation** - Ready for ML improvements

### What Needs Improvement:

⚠️ **Tag discovery** - Users don't know what tags exist
⚠️ **Bulk operations** - One task at a time is slow
⚠️ **Relative dates** - "Next month" doesn't generate tags
⚠️ **Learning application** - Not yet using stored patterns

---

## Final Notes

This session focused on making the task tracker production-ready with intelligent naming, temporal filtering, and robust error handling. The foundation is solid for future AI/ML enhancements.

**Key Philosophy:**
> "Enhancement features should fail gracefully. Core features should fail loudly."

This ensures users always have a working system, even when advanced features have issues.

**Next Session Priorities:**
1. Apply learning patterns to improve naming
2. Add tag management UI
3. Implement bulk operations
4. Add analytics dashboard

---

**Document Created:** 2025-11-19
**Last Updated:** 2025-11-19
**Status:** Active Development
**Version:** 1.0
