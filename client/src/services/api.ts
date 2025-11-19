import { Task, Message, User, Workflow, ApiResponse, TaskListResponse, MessageListResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();
    return data;
  }

  // Tasks
  async getTasks(filters?: {
    workflowType?: string;
    status?: string;
    assignee?: string;
  }): Promise<TaskListResponse> {
    const params = new URLSearchParams();
    if (filters?.workflowType) params.append('workflowType', filters.workflowType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignee) params.append('assignee', filters.assignee);

    const query = params.toString();
    const result = await this.fetch<TaskListResponse>(`/tasks${query ? '?' + query : ''}`);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch tasks');
    }

    return result.data;
  }

  async getTaskById(id: string): Promise<Task> {
    const result = await this.fetch<Task>(`/tasks/${id}`);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch task');
    }

    return result.data;
  }

  async deleteTask(id: string): Promise<void> {
    const result = await this.fetch<void>(`/tasks/${id}`, { method: 'DELETE' });

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete task');
    }
  }

  // Messages
  async getMessages(limit = 100, offset = 0): Promise<MessageListResponse> {
    const result = await this.fetch<MessageListResponse>(`/messages?limit=${limit}&offset=${offset}`);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch messages');
    }

    return result.data;
  }

  async sendMessage(userId: string, content: string): Promise<{ message: Message; tasks: Task[] }> {
    const result = await this.fetch<{ message: Message; tasks: Task[] }>('/messages', {
      method: 'POST',
      body: JSON.stringify({ userId, content }),
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to send message');
    }

    return result.data;
  }

  // Users
  async getUsers(): Promise<User[]> {
    const result = await this.fetch<User[]>('/users');

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch users');
    }

    return result.data;
  }

  async getUserById(id: string): Promise<User> {
    const result = await this.fetch<User>(`/users/${id}`);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch user');
    }

    return result.data;
  }

  async createUser(user: Omit<User, 'createdAt'>): Promise<User> {
    const result = await this.fetch<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to create user');
    }

    return result.data;
  }

  // Workflows
  async getWorkflows(): Promise<Workflow[]> {
    const result = await this.fetch<Workflow[]>('/workflows');

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch workflows');
    }

    return result.data;
  }

  async getWorkflowById(id: string): Promise<Workflow> {
    const result = await this.fetch<Workflow>(`/workflows/${id}`);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch workflow');
    }

    return result.data;
  }
}

export const api = new ApiService();
