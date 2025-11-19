# Tally - System Architecture Reference

**Version:** 1.0
**Last Major Update:** 2025-11-19
**Status:** Production Ready

---

## System Overview

Tally is a conversational task tracker for finance teams with LLM-powered intelligence, designed with a Palantir-inspired UI and real-time collaboration features.

**Core Principle:** Natural language task management with intelligent auto-naming, tagging, and learning.

---

## Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS (custom Palantir theme)
- **State:** React Hooks (useState, useEffect, useMemo)
- **Real-time:** Socket.io Client
- **Date Handling:** date-fns
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Real-time:** Socket.io Server
- **Database:** SQLite with better-sqlite3
- **LLM:** Anthropic Claude (Sonnet) via @anthropic-ai/sdk
- **Date Parsing:** chrono-node
- **Utils:** uuid, dotenv, cors

### Development
- **Language:** TypeScript (strict mode)
- **Package Manager:** npm workspaces
- **Version Control:** Git
- **Monorepo:** client + server + shared types

---

## Architecture Layers

### Client Architecture (Port 3000)

```
┌─────────────────────────────────────┐
│         UI Components               │
│  - App.tsx (root state)             │
│  - ChatInterface.tsx                │
│  - TaskBoard.tsx                    │
│  - UserSelector.tsx                 │
└─────────────┬───────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│      Services & Hooks               │
│  - api.ts (REST client)             │
│  - useSocket.ts (WebSocket)         │
└─────────────┬───────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│      Network Layer                  │
│  - Fetch API (HTTP)                 │
│  - Socket.io (WebSocket)            │
└─────────────────────────────────────┘
```

**Data Flow:**
1. User types message in ChatInterface
2. api.sendMessage() sends POST to /api/messages
3. Server processes and emits Socket.io event
4. useSocket hook receives event
5. Component re-renders with new data

### Server Architecture (Port 3001)

```
┌─────────────────────────────────────┐
│         Routes (Express)            │
│  - /api/tasks                       │
│  - /api/messages                    │
│  - /api/users                       │
│  - /api/workflows                   │
└─────────────┬───────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│      Services (Business Logic)      │
│  - TaskService                      │
│  - TaskNamingService                │
│  - WorkflowService                  │
└─────────────┬───────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│      Parsers (Intelligence)         │
│  - LLMMessageParser (Claude)        │
│  - MessageParser (Deterministic)    │
└─────────────┬───────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│      Models (Data Access)           │
│  - TaskModel                        │
│  - MessageModel                     │
│  - UserModel                        │
│  - WorkflowModel                    │
│  - TaskNameLearningModel            │
└─────────────┬───────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│      Database (SQLite)              │
│  - tasks                            │
│  - messages                         │
│  - users                            │
│  - workflows                        │
│  - task_name_corrections            │
└─────────────────────────────────────┘
```

**Request Flow:**
1. POST /api/messages → messagesRouter
2. TaskService.processMessage()
3. LLMMessageParser.parse() (calls Claude API)
4. TaskNamingService.enhanceTaskName()
5. TaskModel.create()
6. Socket.io broadcasts update
7. Response sent to client

---

## Core Services

### 1. TaskService
**File:** `/server/src/services/TaskService.ts`

**Responsibilities:**
- Process incoming chat messages
- Orchestrate task creation/updates
- Link messages to tasks
- Handle different message types

**Key Methods:**
```typescript
static async processMessage(userId, content): Promise<{
  message: Message;
  tasks: Task[];
  parseResult: ParseResult;
}>

static createTask(userId, parsedData): Task
static updateTask(taskId, parsedData): Task | null
static renameTask(taskId, newTitle, ...): Task | null
static retagTask(taskId, newTags, ...): Task | null
static findTasksByKeywords(keywords): Task[]
```

**Pattern:**
- Always calls TaskNamingService for enhancements
- Uses try-catch for LLM failures
- Returns comprehensive result objects

### 2. TaskNamingService
**File:** `/server/src/services/TaskNamingService.ts`

**Responsibilities:**
- Auto-generate workflow-specific IDs
- Enhance titles with metadata
- Extract month tags (YYYY-MM)
- Record learning corrections
- Provide naming suggestions

**Key Methods:**
```typescript
static enhanceTaskName(rawTitle, workflowType, metadata): TaskNamingResult {
  enhancedTitle: string;
  tags: string[];
  reasoning: string;
}

static extractMonthTag(metadata, rawTitle): string | null
static recordCorrection(originalTitle, correctedTitle, ...): void
static getSuggestions(taskTitle, workflowType): string[]
```

**Workflow Patterns:**
- Invoice: `INV-0001: INV-2847 - TechCorp $25,000`
- Payment: `PAY-0001: Reconcile INV-2847 $25,000`
- Monthly Close: `CLOSE-0001: October 2025 Financial Close`
- Annual Planning: `PLAN-0001: FY2025 Engineering Budget`
- Model Change: `MODEL-0001: Revenue Model v2.1`
- Vendor: `VENDOR-0001: Onboard Acme Corp (Supplies)`

**Critical:** All methods wrapped in try-catch to prevent failures

### 3. LLMMessageParser
**File:** `/server/src/parsers/LLMMessageParser.ts`

**Responsibilities:**
- Parse natural language into structured data
- Classify message types
- Extract task information
- Provide confidence scores
- Link to existing tasks

**Message Types:**
- `task` - Clear actionable work
- `comment` - Observation about existing task
- `question` - Request for help/clarification
- `observation` - Noting an issue without clear action
- `conversation` - Casual chat

**Actions:**
- `create` - New task
- `update` - Modify existing
- `complete` - Mark done
- `block` - Mark blocked
- `handoff` - Reassign
- `comment` - Add note
- `rename` - Change title
- `retag` - Update tags

**Confidence Threshold:** 0.6 (only create tasks if ≥ 0.6)

**Context Provided:**
- Recent 10 messages
- Active tasks (not completed/cancelled)
- User list for assignee detection

---

## Database Schema

### Tables Overview

```sql
-- Core entities
tasks                    -- Task records
messages                 -- Chat messages
users                    -- User accounts
workflows                -- Workflow definitions

-- Learning & Intelligence
task_name_corrections    -- User corrections for ML
```

### Task Schema

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,           -- todo|in_progress|blocked|completed|cancelled
  priority TEXT NOT NULL,         -- low|medium|high|urgent
  workflow_type TEXT NOT NULL,    -- invoice-generation, payment-reconciliation, etc.
  assignees TEXT NOT NULL,        -- JSON array of user IDs
  deadline TEXT,                  -- ISO date string
  blocked_by TEXT,                -- Description of blocker
  metadata TEXT NOT NULL,         -- JSON object (workflow-specific data)
  tags TEXT DEFAULT '[]',         -- JSON array of strings (NEW in v1.0)
  created_by TEXT NOT NULL,       -- User ID
  created_at TEXT NOT NULL,       -- ISO timestamp
  updated_at TEXT NOT NULL,       -- ISO timestamp
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_tasks_workflow_type ON tasks(workflow_type);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
```

### Message Schema

```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,        -- Denormalized for performance
  content TEXT NOT NULL,           -- Raw message text
  timestamp TEXT NOT NULL,         -- ISO timestamp
  parsed_data TEXT,                -- JSON ParseResult
  related_task_ids TEXT,           -- JSON array of task IDs
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_messages_timestamp ON messages(timestamp);
```

### Learning Schema

```sql
CREATE TABLE task_name_corrections (
  id TEXT PRIMARY KEY,
  original_title TEXT NOT NULL,
  corrected_title TEXT NOT NULL,
  workflow_type TEXT NOT NULL,
  original_tags TEXT DEFAULT '[]',  -- JSON array
  corrected_tags TEXT DEFAULT '[]', -- JSON array
  user_message TEXT NOT NULL,       -- The chat message that triggered correction
  created_at TEXT NOT NULL
);

CREATE INDEX idx_corrections_workflow ON task_name_corrections(workflow_type);
CREATE INDEX idx_corrections_created ON task_name_corrections(created_at);
```

---

## Design Patterns

### 1. Service Layer Pattern

**Structure:**
```
Routes → Services → Models → Database
```

**Rules:**
- ✅ Routes handle HTTP, validation, responses
- ✅ Services contain business logic
- ✅ Models handle data access (CRUD)
- ❌ No business logic in routes
- ❌ No data access in services (use models)

**Example:**
```typescript
// routes/tasks.ts - Thin routes
router.post('/', async (req, res) => {
  const { taskData } = req.body;
  const task = TaskService.createTask(userId, taskData);  // Call service
  res.json({ success: true, data: task });
});

// services/TaskService.ts - Business logic
static createTask(userId, parsedData) {
  const namingResult = TaskNamingService.enhanceTaskName(...);  // Enhancement
  const task = TaskModel.create({...});  // Model call
  return task;
}

// models/Task.ts - Data access only
static create(task) {
  const stmt = db.prepare('INSERT INTO tasks ...');
  stmt.run(...);
  return task;
}
```

### 2. Error Handling (3 Levels)

**Level 1: Critical Path (Must Succeed)**
```typescript
// Throw errors, handle at route level
if (!taskData.title) {
  throw new Error('Title required');
}

const task = TaskModel.create(taskData);
if (!task) {
  throw new Error('Failed to create task');
}
```

**Level 2: Enhancement Features (Try-Catch with Fallback)**
```typescript
// Don't break core features if enhancement fails
let learningPatterns = { namingPatterns: [], taggingPatterns: [] };

try {
  learningPatterns = TaskNameLearningModel.getLearningPatterns();
} catch (error) {
  console.error('Learning failed:', error);
  // Continue with empty patterns
}
```

**Level 3: Nice-to-Have (Best Effort)**
```typescript
// Fire and forget
analytics?.track('task_created', { workflowType }).catch(() => {});
```

### 3. Fallback Chain Pattern

**For Data Extraction:**
```typescript
const value =
  metadata.field ||           // Try structured data first
  parseFromTitle(title) ||    // Try natural language
  parseFromDate(date) ||      // Try date fields
  defaultValue;               // Fallback
```

**Example (Month Tag):**
```typescript
// 1. Try metadata
if (metadata.month && metadata.year) {
  return `${year}-${monthNum}`;
}

// 2. Try title parsing
const monthMatch = title.match(/october/i);
const yearMatch = title.match(/\b(20\d{2})\b/);
if (monthMatch && yearMatch) {
  return `${year}-${monthNum}`;
}

// 3. Try due date
if (metadata.dueDate) {
  const date = new Date(metadata.dueDate);
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

// 4. Give up
return null;
```

### 4. Tag System Design

**Storage:**
```sql
tags TEXT DEFAULT '[]'  -- JSON array in TEXT column
```

**Rationale:**
- Simple and flexible
- No join queries needed
- Easy to add/remove tags
- Can search with JSON functions
- Tradeoff: No tag normalization

**Usage:**
```typescript
// Always deduplicate
tags: [...new Set(tags)]

// Parse from DB
tags: row.tags ? JSON.parse(row.tags) : []

// Store to DB
stmt.run(JSON.stringify(task.tags || []))
```

**Tag Types:**
- **Workflow:** `#invoice`, `#payment`, `#monthly-close`
- **Temporal:** `#2025-10`, `#2025-11`, `#2025-12`
- **Value:** `#high-value`, `#urgent`, `#blocked`
- **Custom:** `#techcorp`, `#q4`, `#engineering`

---

## API Endpoints

### Tasks

```
GET    /api/tasks              Get all tasks (with filters)
GET    /api/tasks/:id          Get single task
PATCH  /api/tasks/:id/rename   Rename task via chat
PATCH  /api/tasks/:id/retag    Update task tags
DELETE /api/tasks/:id          Delete task
```

**Query Parameters (GET /api/tasks):**
- `workflowType` - Filter by workflow
- `status` - Filter by status
- `assignee` - Filter by assignee

### Messages

```
POST   /api/messages           Send chat message (creates tasks)
GET    /api/messages           Get recent messages
```

### Users

```
GET    /api/users              Get all users
GET    /api/users/:id          Get single user
```

### Workflows

```
GET    /api/workflows          Get workflow definitions
```

### Health

```
GET    /api/health             Server health check
```

---

## WebSocket Events

### Client → Server

```typescript
socket.emit('message:send', {
  userId: string,
  content: string
});

socket.emit('task:update', {
  taskId: string,
  action: string
});
```

### Server → Client

```typescript
socket.on('message:new', (data) => {
  // New message received, reload messages
});

socket.on('task:updated', (data) => {
  // Task changed, reload tasks
});

socket.on('error', (error) => {
  // Handle error
});
```

---

## Environment Variables

**Required:**

```bash
# /server/.env
ANTHROPIC_API_KEY=sk-ant-api03-...   # Required for LLM parsing
```

**Optional:**

```bash
PORT=3001                             # Server port (default: 3001)
NODE_ENV=development                  # Environment
CLIENT_URL=http://localhost:3000      # CORS origin
```

**Security:**
- `.env` file is gitignored
- Never commit API keys
- Keep `.env.example` with placeholders

---

## File Organization

```
/home/user/tally/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── services/        # API and socket clients
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types.ts         # Client-specific types
│   │   ├── App.tsx          # Root component
│   │   └── main.tsx         # Entry point
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── server/                  # Node.js backend
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   ├── parsers/        # Message parsing
│   │   ├── routes/         # API routes
│   │   ├── server.ts       # Express app
│   │   └── index.ts        # Entry point
│   ├── data/               # SQLite database
│   ├── .env                # Environment variables (gitignored)
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                 # Shared types
│   └── types.ts           # TypeScript interfaces
│
├── .session/              # Session management (NEW)
│   ├── SYSTEM.md          # This file
│   ├── CONTEXT.md         # Current state
│   ├── INDEX.md           # Session history
│   ├── ARCHITECTURE.md    # System design
│   ├── sessions/          # Individual sessions
│   ├── templates/         # Templates
│   └── scripts/           # Automation
│
├── package.json           # Workspace root
├── .gitignore
└── README.md
```

---

## Critical Dependencies

### Backend Dependencies

```json
{
  "@anthropic-ai/sdk": "^0.9.0",    // Claude API client
  "better-sqlite3": "^9.0.0",       // SQLite database
  "chrono-node": "^2.6.0",          // Date parsing
  "express": "^4.18.0",             // HTTP server
  "socket.io": "^4.6.0",            // WebSocket
  "uuid": "^9.0.0",                 // ID generation
  "dotenv": "^16.0.0",              // Environment vars
  "cors": "^2.8.0"                  // CORS middleware
}
```

### Frontend Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "socket.io-client": "^4.6.0",     // WebSocket client
  "date-fns": "^2.30.0",            // Date formatting
  "lucide-react": "^0.292.0"        // Icons
}
```

---

## Code Style Guide

### Naming Conventions

```typescript
// PascalCase for classes and components
class TaskNamingService { }
function ChatInterface() { }

// camelCase for functions and variables
function enhanceTaskName() { }
const userId = '123';

// SCREAMING_SNAKE_CASE for constants
const API_BASE_URL = 'http://localhost:3001';

// kebab-case for CSS classes and files
className="task-board-container"
// file: task-naming-service.ts
```

### TypeScript Patterns

```typescript
// Always type function parameters and returns
function createTask(userId: string, data: ParsedTaskData): Task {
  // ...
}

// Use interfaces for objects
interface TaskNamingResult {
  enhancedTitle: string;
  tags: string[];
  reasoning: string;
}

// Use type for unions
type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed';

// Prefer const for immutable values
const taskId = generateId();

// Use let only when reassignment needed
let enhancedTitle = rawTitle;
```

### Error Messages

```typescript
// Be specific and actionable
throw new Error('Task title is required');  // ✅ Good
throw new Error('Invalid input');           // ❌ Too vague

// Include context in logs
console.error('Failed to enhance task name:', error);  // ✅ Good
console.error('Error:', error);                        // ❌ Too vague
```

---

## Performance Considerations

### Database

- ✅ Indexes on frequently queried columns (workflow_type, status, created_at)
- ✅ Denormalized user_name in messages (avoid join on every message)
- ✅ JSON storage for flexible metadata
- ⚠️ No pagination yet (will need for large datasets)

### Frontend

- ✅ useMemo for filtered messages (magic filter)
- ✅ Component splitting (App, ChatInterface, TaskBoard)
- ✅ Socket.io for real-time updates (no polling)
- ⚠️ No virtualization yet (will need for long message lists)

### Backend

- ✅ In-memory task ID counters (fast generation)
- ✅ Try-catch prevents cascade failures
- ✅ Synchronous SQLite (appropriate for single-user)
- ⚠️ LLM calls are slow (~1-2s per message)

---

## Security Considerations

### Current

- ✅ API key in .env (not in code)
- ✅ .env gitignored
- ✅ CORS configured
- ✅ Input validation on API routes

### Not Implemented (Future)

- ⚠️ Authentication (currently demo users only)
- ⚠️ Authorization (no per-user data access control)
- ⚠️ Rate limiting on API
- ⚠️ Input sanitization for SQL injection
- ⚠️ HTTPS (uses HTTP in development)

**Note:** This is a development/prototype system. Production deployment requires authentication and authorization.

---

## Testing Strategy

### Current Testing

- ✅ Manual testing during development
- ✅ TypeScript compilation as smoke test
- ✅ Build verification (server + client)

### Test Scenarios

**Critical Path:**
1. Send message → task created with ID
2. Task has correct workflow prefix
3. Month tag extracted correctly
4. Tags deduplicated

**Error Handling:**
1. Works without API key (fallback parser)
2. Works with DB errors (learning fails gracefully)
3. Invalid month names don't crash

**Edge Cases:**
1. Multiple month mentions in title (first match wins)
2. Ambiguous task references (keyword matching)
3. Empty metadata (fallback to defaults)

### Future Testing

- Unit tests for TaskNamingService
- Integration tests for API endpoints
- E2E tests with Playwright
- LLM parsing regression tests

---

## Deployment

### Development

```bash
# Terminal 1
cd /home/user/tally/server
npm run dev

# Terminal 2
cd /home/user/tally/client
npm run dev
```

### Production Build

```bash
# Build server
cd /home/user/tally/server
npm run build
# Output: /server/dist/

# Build client
cd /home/user/tally/client
npm run build
# Output: /client/dist/
```

### Production Run

```bash
# Serve client build
cd /home/user/tally/client
npx serve dist -p 3000

# Run server
cd /home/user/tally/server
NODE_ENV=production node dist/server.js
```

---

## Monitoring & Debugging

### Server Logs

```typescript
// Auto-naming output
console.log('Auto-naming result:', namingResult);

// LLM parse results
console.log('LLM Parse Result:', {
  messageType,
  isTaskWorthy,
  confidence,
  reasoning
});

// Error handling triggers
console.error('Error loading learning patterns:', error);
```

### Database Inspection

```bash
# Open database
sqlite3 /home/user/tally/server/data/tally.db

# View schema
.schema tasks

# Query data
SELECT id, title, tags FROM tasks LIMIT 10;
SELECT * FROM task_name_corrections;
```

### Network Debugging

```javascript
// In browser console
localStorage.debug = 'socket.io-client:*';
// Reload page to see WebSocket messages
```

---

## Migration Guide

### Adding a New Field to Task

```sql
-- In database.ts
ALTER TABLE tasks ADD COLUMN new_field TEXT DEFAULT 'default';

-- In types.ts
interface Task {
  // ...existing fields
  newField?: string;
}

-- In Task.ts (rowToTask)
newField: row.new_field || undefined,

-- In Task.ts (create)
stmt.run(
  // ...existing params
  task.newField || null
);
```

### Adding a New Workflow

```typescript
// In TaskNamingService.ts
case 'new-workflow':
  enhancedTitle = this.enhanceNewWorkflowName(rawTitle, metadata, taskId);
  tags.push('new-workflow', 'related-tag');
  if (metadata.specificField) tags.push(metadata.specificField.toLowerCase());
  break;

// Add helper method
private static enhanceNewWorkflowName(
  rawTitle: string,
  metadata: Record<string, any>,
  taskId: string
): string {
  const field = metadata.field || 'Unknown';
  return `${taskId}: ${field} ${rawTitle}`;
}

// Add to prefix map
'new-workflow': 'NEW',
```

---

## Changelog

### Version 1.0 (2025-11-19)

**Added:**
- Auto-naming system with workflow IDs
- YYYY-MM month tags
- Chat-based rename/retag
- Learning system foundation
- Error handling for enhancement features
- Tag display in UI

**Changed:**
- TaskService now calls TaskNamingService
- LLMMessageParser supports rename/retag actions
- Task schema includes tags column

**Database:**
- Added `tags` column to tasks
- Added `task_name_corrections` table

---

**Last Updated:** 2025-11-19
**Update Frequency:** Major changes only
**Maintained By:** Development team
