import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initializeDatabase } from './models/database';
import { WorkflowService } from './services/WorkflowService';
import { UserModel } from './models/User';
import tasksRouter from './routes/tasks';
import messagesRouter from './routes/messages';
import usersRouter from './routes/users';
import workflowsRouter from './routes/workflows';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
initializeDatabase();

// Initialize default workflows
WorkflowService.initializeDefaultWorkflows();

// Initialize demo users if none exist
const users = UserModel.findAll();
if (users.length === 0) {
  const demoUsers = [
    { id: uuidv4(), name: 'Alice Johnson', email: 'alice@example.com' },
    { id: uuidv4(), name: 'Bob Smith', email: 'bob@example.com' },
    { id: uuidv4(), name: 'Sarah Chen', email: 'sarah@example.com' },
    { id: uuidv4(), name: 'Mike Davis', email: 'mike@example.com' }
  ];

  for (const user of demoUsers) {
    UserModel.create(user);
    console.log(`Created demo user: ${user.name}`);
  }
}

// API Routes
app.use('/api/tasks', tasksRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/users', usersRouter);
app.use('/api/workflows', workflowsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  // Handle new messages
  socket.on('message:send', async (data) => {
    try {
      const { userId, content } = data;
      // The actual processing is done via REST API
      // This just broadcasts to other clients
      socket.broadcast.emit('message:new', data);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  // Handle task updates
  socket.on('task:update', (data) => {
    socket.broadcast.emit('task:updated', data);
  });
});

// Attach io to app for use in routes
app.set('io', io);

// Start server
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Tally Server Running                  ║
║  Port: ${PORT}                           ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
╚════════════════════════════════════════╝
  `);
});

export { io };
