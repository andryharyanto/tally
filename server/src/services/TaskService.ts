import { v4 as uuidv4 } from 'uuid';
import { Task, Message, ParsedTaskData } from '../../../shared/types';
import { TaskModel } from '../models/Task';
import { MessageModel } from '../models/Message';
import { UserModel } from '../models/User';
import { MessageParser } from '../parsers/MessageParser';

export class TaskService {
  static async processMessage(userId: string, content: string): Promise<{
    message: Message;
    tasks: Task[];
  }> {
    // Get all users for assignee detection
    const users = UserModel.findAll();
    const user = UserModel.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Parse the message
    const parsedData = MessageParser.parse(content, users);

    // Create the message
    const message: Omit<Message, 'timestamp'> = {
      id: uuidv4(),
      userId: user.id,
      userName: user.name,
      content,
      parsedData,
      relatedTaskIds: []
    };

    const tasks: Task[] = [];

    // Process based on parsed action
    if (parsedData.action === 'create' && parsedData.taskTitle) {
      const task = this.createTask(user.id, parsedData);
      tasks.push(task);
      message.relatedTaskIds = [task.id];
    } else if (parsedData.action === 'update' || parsedData.action === 'complete' || parsedData.action === 'block') {
      // Try to find related tasks
      const relatedTasks = this.findRelatedTasks(parsedData);

      for (const task of relatedTasks) {
        const updated = this.updateTask(task.id, parsedData);
        if (updated) {
          tasks.push(updated);
          message.relatedTaskIds!.push(updated.id);
        }
      }

      // If no related tasks found, create a new one
      if (relatedTasks.length === 0 && parsedData.taskTitle) {
        const task = this.createTask(user.id, parsedData);
        tasks.push(task);
        message.relatedTaskIds = [task.id];
      }
    } else if (parsedData.action === 'handoff') {
      const relatedTasks = this.findRelatedTasks(parsedData);

      for (const task of relatedTasks) {
        if (parsedData.assignees && parsedData.assignees.length > 0) {
          const updated = TaskModel.update(task.id, { assignees: parsedData.assignees });
          if (updated) {
            tasks.push(updated);
            message.relatedTaskIds!.push(updated.id);
          }
        }
      }
    }

    // Save the message
    const savedMessage = MessageModel.create(message);

    return {
      message: savedMessage,
      tasks
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
