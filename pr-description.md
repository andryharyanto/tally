## Summary

This PR introduces a comprehensive conversational task tracker for finance teams with advanced LLM-powered features, intelligent message parsing, auto-naming/tagging with temporal filtering, learning system, and a complete session management system for context preservation across development sessions.

## Key Features

### 🤖 LLM-Powered Message Parsing
- **Nuanced Intent Understanding**: Distinguishes between tasks, comments, questions, observations, and casual conversation
- **Context-Aware Parsing**: Uses recent conversation history and active tasks for better accuracy
- **Strict Confidence Scoring**: Only creates tasks for clear, actionable work (0.7+ confidence)
- **Smart Task References**: Automatically links comments/questions to existing tasks using keyword matching

### 🎯 Auto-Naming & Auto-Tagging System
- **Workflow-Specific Task IDs**: Auto-generates sequential IDs (INV-0001, PAY-0002, CLOSE-0003, etc.)
- **Contextual Titles**: Enhances task names with metadata (e.g., "INV-0001: INV-2847 - TechCorp $25,000")
- **Auto-Generated Tags**: Creates relevant tags based on workflow type and metadata (#invoice, #billing, #high-value)
- **Chat-Based Corrections**: Rename and retag tasks using natural language commands

### 🧠 Learning System
- **Correction Tracking**: Records all user corrections to task names and tags
- **Pattern Recognition**: Extracts naming and tagging patterns from correction history
- **Future ML Integration**: Foundation for machine learning-based naming improvements

### 🎨 Magic Filter
- **Task-Specific Views**: Click any task to filter chat messages related to that task only
- **Visual Indicators**: Cyan glow on selected tasks, filter banner with message count
- **Bidirectional State**: Seamlessly synced between chat and task board

### 💬 Message Type Classification
- **TASK**: Clear actionable work requiring tracking
- **COMMENT**: Observations about existing tasks
- **QUESTION**: Requests for help or clarification
- **OBSERVATION**: Noting issues without clear action
- **CONVERSATION**: Casual chat and acknowledgments

### 📅 Temporal Filtering with Month Tags
- **YYYY-MM Format**: Auto-generates month tags like `#2025-10`, `#2025-11` for easy filtering
- **Smart Extraction**: Parses months from metadata, task titles, and due dates
- **Multiple Formats**: Handles month names (October), abbreviations (Oct), and numbers (10)
- **Fallback Logic**: Tries metadata first, then title parsing, then due date
- **Finance-Friendly**: Perfect for tracking monthly close, quarterly reviews, and fiscal periods

### 📚 Session Management System
- **Context Preservation**: Zero context loss between Claude Code sessions
- **Hierarchical Files**: CONTEXT.md (current state), INDEX.md (history), ARCHITECTURE.md (design)
- **Automatic Session Notes**: Claude maintains running logs during development
- **Session Lifecycle**: Start → Develop → Wrap with automatic synthesis
- **Quick Onboarding**: New developers read CONTEXT.md and get up to speed in 30 minutes
- **Searchable History**: Find past decisions and learnings instantly
- **Automation Scripts**: session-start.sh and session-wrap.sh for manual use

## Example Usage

### Natural Language Task Creation
```
"I am starting Humana Invoice October 2025"
→ Creates: "INV-0001: Humana Invoice" with tags: #invoice, #billing, #humana, #2025-10
```

### Comments and Questions
```
"the TechCorp invoice looks wrong"
→ Links to TechCorp invoice task, no new task created
```

### Rename/Retag via Chat
```
"rename the Humana invoice to Humana Q4 Invoice"
→ Updates task title and records correction for learning
```

### Month-Based Filtering
```
"November 2025 Financial Close"
→ Creates: "CLOSE-0001: November 2025 Financial Close" with tags: #monthly-close, #financial-reporting, #november, #2025-11

Filter all Q4 2025 tasks: #2025-10, #2025-11, #2025-12
```

### Session Management
```
User: "Start new session on tag management UI"

Claude:
✅ Context loaded!
- Auto-naming: Complete
- Month tags: Implemented
- Next: Tag management UI
Ready to begin!

[Development happens with automatic note-taking]

User: "Wrap session"

Claude:
✅ Session synthesized
✅ CONTEXT.md updated
✅ INDEX.md updated
📊 3 goals completed, 7 files changed
📌 Next: Apply learning patterns
```

## Technical Implementation

### Backend
- **TaskNamingService**: Translation layer for auto-naming, tagging, and month extraction
- **Month Tag Extraction**: Smart parsing from metadata, titles, and dates with fallback logic
- **Error Handling**: Robust try-catch blocks ensure core operations work even if learning system fails
- **TaskNameLearningModel**: Stores user corrections for learning
- **Enhanced LLM Parser**: Supports rename/retag actions with 8 action types
- **Task Reference Matching**: Intelligent keyword-based scoring (exact phrase: 100 pts, keywords: 10 pts)
- **API Endpoints**: PATCH `/tasks/:id/rename` and `/tasks/:id/retag`

### Frontend
- **Tag Display**: Purple badges with #tag-name format on task cards (includes month tags)
- **Month Tag Visibility**: YYYY-MM tags displayed prominently for temporal filtering
- **Magic Filter UI**: Filter banner, empty states, and selection indicators
- **Message Type Badges**: Color-coded badges for QUESTION, COMMENT, OBSERVATION

### Database
- **tags Column**: Added to tasks table for auto-generated and user-defined tags
- **task_name_corrections Table**: Stores learning data with workflow context
- **Indexes**: Optimized for workflow and temporal queries

### Session Management
- **.session/CONTEXT.md**: Current project state (always read first)
- **.session/INDEX.md**: Session history with searchable metadata
- **.session/ARCHITECTURE.md**: System design reference (15+ pages)
- **.session/sessions/**: Individual session notes with full details
- **.session/scripts/**: Automation for session start/wrap
- **Hierarchical Context**: Progressive detail from high-level to specifics

## Design System
- **Palantir-Inspired UI**: Dark theme with cyan accents and monospace fonts
- **Grid Backgrounds**: Subtle technical aesthetic
- **Glow Effects**: Cyan glows on active elements
- **Component Library**: Comprehensive documentation for all UI patterns

## Supported Workflows

1. **Invoice Generation** → INV-XXXX with customer, amount, invoice number
2. **Payment Reconciliation** → PAY-XXXX with payment details
3. **Monthly Close** → CLOSE-XXXX with month/year
4. **Annual Planning** → PLAN-XXXX with fiscal year and department
5. **Model Change Control** → MODEL-XXXX with version tracking
6. **Vendor Onboarding** → VENDOR-XXXX with category

## Testing

All code compiles successfully:
- ✅ Server TypeScript build passing
- ✅ Client TypeScript build passing
- ✅ Vite production build successful
- ✅ API key configured and ready
- ✅ Session management system tested with sample session
- ✅ Context files validated and structured

## Security

- ✅ `.env` file properly gitignored
- ✅ API keys secured in environment variables
- ✅ No sensitive data in repository

## Migration Notes

- Database schema auto-migrates on server start
- Existing tasks compatible (tags default to empty array)
- No breaking changes to existing functionality

## Future Enhancements

### Task Management
- ML-based naming using correction patterns
- Workflow-specific learning models
- Bulk rename/retag operations
- Tag suggestions based on task content
- Tag management UI with filter and editor

### Session Management
- Automated CONTEXT.md synthesis with AI
- Session duration tracking and analytics
- Git integration (auto-commit on wrap)
- Tag-based session search
- Session analytics dashboard
