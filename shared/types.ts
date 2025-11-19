// User
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

// Task
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  workflowType: string;
  assignees: string[]; // user IDs
  deadline?: string;
  blockedBy?: string; // description of blocker
  metadata: Record<string, any>; // workflow-specific data
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Message
export interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  parsedData?: ParsedTaskData;
  relatedTaskIds?: string[];
}

// Parsed data from messages
export interface ParsedTaskData {
  action?: 'create' | 'update' | 'complete' | 'block' | 'handoff' | 'comment';
  taskTitle?: string;
  assignees?: string[];
  deadline?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  workflowType?: string;
  metadata?: Record<string, any>;
  blockedBy?: string;
}

// Workflow
export interface Workflow {
  id: string;
  name: string;
  description: string;
  stages: WorkflowStage[];
  fields: WorkflowField[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStage {
  id: string;
  name: string;
  order: number;
}

export interface WorkflowField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
  options?: string[];
  required: boolean;
}

// Invoice-specific workflow metadata
export interface InvoiceMetadata {
  invoiceNumber?: string;
  customerName?: string;
  amount?: number;
  dueDate?: string;
  paid?: boolean;
  paidDate?: string;
}

// Monthly close workflow metadata
export interface MonthlyCloseMetadata {
  month: string;
  year: number;
  checklistItems: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

// Model change control metadata
export interface ModelChangeMetadata {
  modelName: string;
  version: string;
  changeDescription: string;
  impactAreas: string[];
  approvers: string[];
  approved: boolean;
  approvedAt?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
}
