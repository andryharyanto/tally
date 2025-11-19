import { v4 as uuidv4 } from 'uuid';
import { Task, Message, ParsedTaskData } from '../../../shared/types';
import { TaskModel } from '../models/Task';
import { MessageModel } from '../models/Message';
import { UserModel } from '../models/User';
import { LLMMessageParser, ParseResult } from '../parsers/LLMMessageParser';
import { MessageParser } from '../parsers/MessageParser';

export class TaskService {
  static async processMessage(userId: string, content: string): Promise<{
    message: Message;
    tasks: Task[];
    parseResult: ParseResult;
  }> {
    // Get all users for assignee detection
    const users = UserModel.findAll();
    const user = UserModel.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Get recent conversation context
    const recentMessages = MessageModel.findRecent(10);
    const conversationContext = recentMessages
      .slice(-10)
      .map(m => `${m.userName}: ${m.content}`);

    // Get recent active tasks for context
    const recentTasks = TaskModel.findAll()
      .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
      .slice(0, 10)
      .map(t => ({ id: t.id, title: t.title, status: t.status }));

    // Parse the message with LLM (with fallback to deterministic)
    let parseResult: ParseResult;

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        parseResult = await LLMMessageParser.parse(content, users, conversationContext, recentTasks);
        console.log('LLM Parse Result:', {
          messageType: parseResult.messageType,
          isTaskWorthy: parseResult.isTaskWorthy,
          confidence: parseResult.confidence,
          taskReference: parseResult.taskReference,
          reasoning: parseResult.reasoning
        });
      } catch (error) {
        console.error('LLM parsing failed, using deterministic fallback:', error);
        parseResult = MessageParser.parse(content, users);
      }
    } else {
      console.warn('No ANTHROPIC_API_KEY found, using deterministic parser');
      parseResult = MessageParser.parse(content, users);
    }

    // Create the message
    const message: Omit<Message, 'timestamp'> = {
      id: uuidv4(),
      userId: user.id,
      userName: user.name,
      content,
      parsedData: parseResult, // Store full parse result
      relatedTaskIds: []
    };

    const tasks: Task[] = [];

    // Handle different message types
    if (parseResult.messageType === 'comment' || parseResult.messageType === 'question' || parseResult.messageType === 'observation') {
      // For comments/questions/observations, try to link to existing task
      if (parseResult.taskReference) {
        const relatedTasks = this.findTasksByKeywords(parseResult.taskReference);
        if (relatedTasks.length > 0) {
          // Link message to the most recent related task
          message.relatedTaskIds = relatedTasks.slice(0, 1).map(t => t.id);
          console.log(`Linked ${parseResult.messageType} to task:`, relatedTasks[0].title);
        }
      }
      // Don't create new tasks for comments/questions/observations
    } else if (parseResult.isTaskWorthy) {
      // Handle batch operations
      if (parseResult.batchItems && parseResult.batchItems.length > 1) {
        for (const item of parseResult.batchItems) {
          const batchTaskData = { ...parseResult, taskTitle: `${parseResult.taskTitle} - ${item}` };
          const task = this.createTask(user.id, batchTaskData);
          tasks.push(task);
          message.relatedTaskIds!.push(task.id);
        }
      } else if (parseResult.action === 'create' && parseResult.taskTitle) {
        const task = this.createTask(user.id, parseResult);
        tasks.push(task);
        message.relatedTaskIds = [task.id];
      } else if (parseResult.action === 'update' || parseResult.action === 'complete' || parseResult.action === 'block') {
        // Try to find related tasks
        let relatedTasks: Task[] = [];
        if (parseResult.taskReference) {
          relatedTasks = this.findTasksByKeywords(parseResult.taskReference);
        } else if (parseResult.taskTitle) {
          relatedTasks = this.findRelatedTasks(parseResult);
        }

        for (const task of relatedTasks) {
          const updated = this.updateTask(task.id, parseResult);
          if (updated) {
            tasks.push(updated);
            message.relatedTaskIds!.push(updated.id);
          }
        }

        // If no related tasks found and we have a clear task title, create a new one
        if (relatedTasks.length === 0 && parseResult.taskTitle) {
          const task = this.createTask(user.id, parseResult);
          tasks.push(task);
          message.relatedTaskIds = [task.id];
        }
      } else if (parseResult.action === 'handoff') {
        let relatedTasks: Task[] = [];
        if (parseResult.taskReference) {
          relatedTasks = this.findTasksByKeywords(parseResult.taskReference);
        } else if (parseResult.taskTitle) {
          relatedTasks = this.findRelatedTasks(parseResult);
        }

        for (const task of relatedTasks) {
          if (parseResult.assignees && parseResult.assignees.length > 0) {
            const updated = TaskModel.update(task.id, { assignees: parseResult.assignees });
            if (updated) {
              tasks.push(updated);
              message.relatedTaskIds!.push(updated.id);
            }
          }
        }
      } else if (parseResult.action === 'comment' && parseResult.taskReference) {
        // Handle explicit comments with task references
        const relatedTasks = this.findTasksByKeywords(parseResult.taskReference);
        if (relatedTasks.length > 0) {
          message.relatedTaskIds = relatedTasks.slice(0, 1).map(t => t.id);
        }
      }
    }

    // Save the message
    const savedMessage = MessageModel.create(message);

    return {
      message: savedMessage,
      tasks,
      parseResult
    };
  }

  static createTask(userId: string, parsedData: ParsedTaskData): Task {
    const task: Omit<Task, 'createdAt' | 'updatedAt'> = {
      id: uuidv4(),
      title: parsedData.taskTitle || 'Untitled task',
      description: undefined,
      status: parsedData.status || 'todo',
      priority: parsedData.priority || 'medium',
      workflowType: parsedData.workflowType || 'general',
      assignees: parsedData.assignees || [userId],
      deadline: parsedData.deadline,
      blockedBy: parsedData.blockedBy,
      metadata: parsedData.metadata || {},
      createdBy: userId
    };

    return TaskModel.create(task);
  }

  static updateTask(taskId: string, parsedData: ParsedTaskData): Task | null {
    const updates: Partial<Task> = {};

    if (parsedData.status) {
      updates.status = parsedData.status;
    }

    if (parsedData.priority) {
      updates.priority = parsedData.priority;
    }

    if (parsedData.assignees) {
      updates.assignees = parsedData.assignees;
    }

    if (parsedData.deadline) {
      updates.deadline = parsedData.deadline;
    }

    if (parsedData.blockedBy) {
      updates.blockedBy = parsedData.blockedBy;
      updates.status = 'blocked';
    }

    if (parsedData.action === 'complete') {
      updates.status = 'completed';
    }

    if (parsedData.metadata) {
      const task = TaskModel.findById(taskId);
      if (task) {
        updates.metadata = { ...task.metadata, ...parsedData.metadata };
      }
    }

    return TaskModel.update(taskId, updates);
  }

  static findRelatedTasks(parsedData: ParsedTaskData): Task[] {
    const allTasks = TaskModel.findAll();

    if (!parsedData.taskTitle) {
      return [];
    }

    // Simple similarity matching
    const title = parsedData.taskTitle.toLowerCase();
    const relatedTasks = allTasks.filter(task => {
      const taskTitle = task.title.toLowerCase();

      // Check if titles have significant overlap
      const words1 = title.split(/\s+/);
      const words2 = taskTitle.split(/\s+/);
      const commonWords = words1.filter(w => words2.includes(w) && w.length > 3);

      return commonWords.length >= 2;
    });

    // Return most recent matching task
    return relatedTasks.slice(0, 1);
  }

  static findTasksByKeywords(keywords: string): Task[] {
    const allTasks = TaskModel.findAll();
    const searchTerms = keywords.toLowerCase().split(/\s+/).filter(term => term.length > 2);

    if (searchTerms.length === 0) {
      return [];
    }

    // Score tasks based on keyword matches
    const scoredTasks = allTasks.map(task => {
      const taskTitle = task.title.toLowerCase();
      const taskMetadata = JSON.stringify(task.metadata).toLowerCase();

      let score = 0;

      // Check title for exact phrase match (highest score)
      if (taskTitle.includes(keywords.toLowerCase())) {
        score += 100;
      }

      // Check title for individual keyword matches
      searchTerms.forEach(term => {
        if (taskTitle.includes(term)) {
          score += 10;
        }
        if (taskMetadata.includes(term)) {
          score += 5;
        }
      });

      // Boost score for active tasks
      if (task.status === 'in_progress' || task.status === 'todo') {
        score += 2;
      }

      return { task, score };
    });

    // Filter and sort by score
    const matchedTasks = scoredTasks
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.task);

    return matchedTasks;
  }

  static getAllTasks(filters?: {
    workflowType?: string;
    status?: string;
    assignee?: string;
  }): Task[] {
    return TaskModel.findAll(filters as any);
  }

  static getTaskById(id: string): Task | null {
    return TaskModel.findById(id);
  }

  static deleteTask(id: string): boolean {
    return TaskModel.delete(id);
  }
}
