# Tally - Conversational Task Tracker for Finance Teams

Tally is your finance team's conversational program manager. Just talk to it—"analyzed invoices for Acme" or "waiting on vendor payment"—and it updates a shared board everyone sees. No boxes or dropdowns. Handles invoice tracking, monthly close, model changes. Want a new workflow? Ask for it. It's PM software that works like humans actually work.

## Features

### 🗣️ Natural Language Interface
- **Conversational Task Management**: Describe work in plain language instead of filling out forms
- **Intelligent Parsing**: Automatically extracts tasks, deadlines, assignees, and priorities from messages
- **Smart Understanding**: Recognizes finance-specific terms and patterns

### 📋 Shared Task Board
- **Real-time Collaboration**: Everyone sees the same master list, updated instantly
- **Multi-person Tasks**: Natural handling of shared ownership and handoffs
- **Visual Organization**: Tasks grouped by status with clear priority indicators
- **Rich Metadata**: Automatically captures invoice numbers, customer names, amounts, and more

### 🔄 Finance-Specific Workflows
Ships with pre-built workflows for common finance operations:

1. **Invoice Generation**: Track invoice creation for multiple customers and batch operations
2. **Payment Reconciliation**: Match invoices with payments, track what's paid/pending
3. **Monthly Close**: Recurring checklists with progress tracking
4. **Annual Planning**: Project workflows with milestones
5. **Model Change Control**: Version tracking, approvals, and impact documentation
6. **Vendor Onboarding**: Manage vendor setup and documentation

### 🤝 Team Collaboration
- **Conversational Handoffs**: "Passing the vendor review to Sarah"
- **Shared Visibility**: See who's doing what and where help is needed
- **Blocker Tracking**: "Waiting on payment for INV-2847" automatically marks tasks as blocked

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Socket.io-client (real-time updates)
- date-fns (date formatting)
- Lucide React (icons)

**Backend:**
- Node.js + Express
- TypeScript
- SQLite (database)
- Socket.io (WebSocket)
- chrono-node (date parsing)

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tally
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Server (.env in root)
cp server/.env.example server/.env

# Client (.env in root)
cp client/.env.example client/.env
```

4. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend dev server on `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Usage Examples

### Creating Tasks
Just describe what you're doing:
- "Generated invoices for Acme and TechCorp"
- "Working on the monthly close for October"
- "Need to review the Q4 budget model"

### Status Updates
- "Completed the vendor onboarding for Acme"
- "Finished reconciling March payments"

### Setting Deadlines
- "Need to finish the annual plan by Friday"
- "Invoice review due tomorrow"

### Handling Blockers
- "Waiting on payment for INV-2847"
- "Stuck on vendor approval - need CFO sign-off"
- "Blocked on data from accounting"

### Team Handoffs
- "Passing the vendor review to Sarah"
- "Assigning the reconciliation to Mike"
- "Giving invoice batch to Alice"

### Multi-person Collaboration
- "Alice and Bob are working on the model update"
- Multiple people can be mentioned in tasks naturally

## Project Structure

```
tally/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── TaskBoard.tsx
│   │   │   └── UserSelector.tsx
│   │   ├── hooks/         # Custom React hooks
│   │   │   └── useSocket.ts
│   │   ├── services/      # API services
│   │   │   └── api.ts
│   │   ├── styles/        # CSS files
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx        # Main app component
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── models/        # Database models
│   │   │   ├── database.ts
│   │   │   ├── Task.ts
│   │   │   ├── Message.ts
│   │   │   ├── User.ts
│   │   │   └── Workflow.ts
│   │   ├── routes/        # API routes
│   │   │   ├── tasks.ts
│   │   │   ├── messages.ts
│   │   │   ├── users.ts
│   │   │   └── workflows.ts
│   │   ├── services/      # Business logic
│   │   │   ├── TaskService.ts
│   │   │   └── WorkflowService.ts
│   │   ├── parsers/       # NLP parsing
│   │   │   └── MessageParser.ts
│   │   └── server.ts      # Main server file
│   └── package.json
│
├── shared/                 # Shared TypeScript types
│   └── types.ts
│
└── package.json           # Root package.json
```

## How It Works

### Natural Language Processing
The system uses pattern matching and keyword detection to understand conversational input:

1. **Action Detection**: Identifies if you're creating, updating, completing, or blocking a task
2. **Entity Extraction**: Finds task titles, assignees, deadlines, and priorities
3. **Workflow Classification**: Recognizes finance-specific patterns (invoices, reconciliation, etc.)
4. **Metadata Extraction**: Captures invoice numbers, amounts, customer names, etc.

### Real-time Updates
- WebSocket connections keep all clients synchronized
- Changes appear instantly for all team members
- No page refresh needed

### Data Persistence
- SQLite database stores all tasks, messages, and workflows
- Full history of all conversations and task changes
- Simple file-based storage (easy to backup and migrate)

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks (with optional filters)
- `GET /api/tasks/:id` - Get task by ID
- `DELETE /api/tasks/:id` - Delete a task

### Messages
- `GET /api/messages` - Get message history
- `POST /api/messages` - Send a new message (creates/updates tasks)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user

### Workflows
- `GET /api/workflows` - Get all workflows
- `GET /api/workflows/:id` - Get workflow by ID

## Future Enhancements

- **Conversational Workflow Creation**: Define new workflows through conversation
- **AI-Powered Parsing**: Integrate with LLMs for better understanding
- **Advanced Search**: Find tasks by natural language queries
- **Notifications**: Alert team members about handoffs and blockers
- **Analytics**: Insights into team productivity and bottlenecks
- **Integrations**: Connect with accounting software, Slack, email
- **Authentication**: Proper user auth (currently demo mode)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for finance teams who want to work the way they think.
