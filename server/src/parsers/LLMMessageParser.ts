import Anthropic from '@anthropic-ai/sdk';
import * as chrono from 'chrono-node';
import { ParsedTaskData, TaskStatus, TaskPriority } from '../../../shared/types';

export interface ParseResult extends ParsedTaskData {
  confidence: number;
  isTaskWorthy: boolean;
  suggestions?: string[];
  batchItems?: string[];
  reasoning?: string;
}

interface TaskExtractionTool {
  isTask: boolean;
  confidence: number;
  action?: 'create' | 'update' | 'complete' | 'block' | 'handoff' | 'comment';
  taskTitle?: string;
  assigneeNames?: string[];
  deadline?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  workflowType?: string;
  blockedBy?: string;
  batchItems?: string[];
  metadata?: Record<string, any>;
  reasoning: string;
}

export class LLMMessageParser {
  private static client: Anthropic | null = null;

  private static getClient(): Anthropic {
    if (!this.client) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY not found in environment variables');
      }
      this.client = new Anthropic({ apiKey });
    }
    return this.client;
  }

  static async parse(
    content: string,
    users: Array<{ id: string; name: string }>,
    conversationContext?: string[]
  ): Promise<ParseResult> {
    try {
      const client = this.getClient();

      const userList = users.map(u => u.name).join(', ');
      const contextStr = conversationContext && conversationContext.length > 0
        ? `\n\nRecent conversation:\n${conversationContext.join('\n')}`
        : '';

      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        tools: [{
          name: 'extract_task_info',
          description: 'Extracts task information from a message in a finance team chat. Determines if the message is work-related or just conversation.',
          input_schema: {
            type: 'object',
            properties: {
              isTask: {
                type: 'boolean',
                description: 'Whether this message describes actual work that should be tracked as a task'
              },
              confidence: {
                type: 'number',
                description: 'Confidence score from 0.0 to 1.0 that this is a task'
              },
              action: {
                type: 'string',
                enum: ['create', 'update', 'complete', 'block', 'handoff', 'comment'],
                description: 'The action being described'
              },
              taskTitle: {
                type: 'string',
                description: 'A clear, concise title for the task'
              },
              assigneeNames: {
                type: 'array',
                items: { type: 'string' },
                description: 'Names of people assigned to or mentioned in relation to this task'
              },
              deadline: {
                type: 'string',
                description: 'Natural language deadline if mentioned (e.g., "tomorrow", "Friday", "next week")'
              },
              status: {
                type: 'string',
                enum: ['todo', 'in_progress', 'blocked', 'completed', 'cancelled'],
                description: 'Current status of the task'
              },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent'],
                description: 'Priority level'
              },
              workflowType: {
                type: 'string',
                description: 'Type of workflow: invoice-generation, payment-reconciliation, monthly-close, annual-planning, model-change, vendor-onboarding, or general'
              },
              blockedBy: {
                type: 'string',
                description: 'What is blocking this task if it\'s blocked'
              },
              batchItems: {
                type: 'array',
                items: { type: 'string' },
                description: 'If this is a batch operation (e.g., "invoices for Acme and TechCorp"), list the separate items'
              },
              metadata: {
                type: 'object',
                description: 'Finance-specific metadata like invoiceNumber, customerName, amount, etc.'
              },
              reasoning: {
                type: 'string',
                description: 'Brief explanation of why you classified it this way'
              }
            },
            required: ['isTask', 'confidence', 'reasoning']
          }
        }],
        messages: [{
          role: 'user',
          content: `You are analyzing a message in a finance team's task management chat.

Context:
- Available team members: ${userList}
- Finance workflows: invoice generation, payment reconciliation, monthly close, annual planning, model change control, vendor onboarding${contextStr}

Analyze this message and extract task information:
"${content}"

Determine:
1. Is this actual work to track (isTask: true) or just conversation (isTask: false)?
2. If it's work, extract all relevant details
3. If multiple items are mentioned (e.g., "invoices for Acme and TechCorp"), identify them as batchItems
4. Provide a confidence score (0.0-1.0)

Examples:
- "hey how are you" → isTask: false, confidence: 0.1
- "Generated invoice for TechCorp $25k" → isTask: true, confidence: 0.95, action: create
- "Waiting on payment for INV-2847" → isTask: true, confidence: 0.9, action: block
- "Invoices for Acme and TechCorp" → isTask: true, batchItems: ["Acme", "TechCorp"]`
        }]
      });

      // Extract tool use response
      const toolUse = response.content.find(c => c.type === 'tool_use');
      if (!toolUse || toolUse.type !== 'tool_use') {
        // Fallback to deterministic parsing
        console.warn('No tool use in response, falling back to deterministic parser');
        return this.fallbackParse(content, users);
      }

      const extracted = toolUse.input as TaskExtractionTool;

      // Map assignee names to IDs
      const assignees = (extracted.assigneeNames || [])
        .map(name => {
          const user = users.find(u =>
            u.name.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(u.name.toLowerCase())
          );
          return user?.id;
        })
        .filter((id): id is string => id !== undefined);

      // Parse deadline using chrono-node
      let deadlineISO: string | undefined;
      if (extracted.deadline) {
        const parsed = chrono.parse(extracted.deadline);
        if (parsed.length > 0) {
          deadlineISO = parsed[0].start.date().toISOString();
        }
      }

      const result: ParseResult = {
        confidence: extracted.confidence,
        isTaskWorthy: extracted.isTask && extracted.confidence >= 0.6,
        action: extracted.action,
        taskTitle: extracted.taskTitle,
        assignees,
        deadline: deadlineISO,
        status: extracted.status,
        priority: extracted.priority,
        workflowType: extracted.workflowType,
        blockedBy: extracted.blockedBy,
        batchItems: extracted.batchItems,
        metadata: extracted.metadata || {},
        reasoning: extracted.reasoning
      };

      // Add suggestions for batch operations
      if (extracted.batchItems && extracted.batchItems.length > 1) {
        result.suggestions = [
          `Create ${extracted.batchItems.length} separate tasks?`,
          'Create one grouped task?'
        ];
      }

      return result;

    } catch (error) {
      console.error('LLM parsing error:', error);
      // Fallback to deterministic parsing
      return this.fallbackParse(content, users);
    }
  }

  // Fallback to simple pattern matching if LLM fails
  private static fallbackParse(
    content: string,
    users: Array<{ id: string; name: string }>
  ): ParseResult {
    const lowerContent = content.toLowerCase();

    // Simple conversation detection
    const isConversation = /^(hi|hello|hey|thanks|thank you|ok|sure|yes|no)\b/i.test(content);

    if (isConversation) {
      return {
        confidence: 0.1,
        isTaskWorthy: false,
        reasoning: 'Detected as conversational greeting/acknowledgment'
      };
    }

    // Simple task detection
    const hasWorkKeywords = /\b(invoice|payment|reconcil|budget|complete|finish|start|generate)\b/i.test(content);

    if (hasWorkKeywords) {
      return {
        confidence: 0.7,
        isTaskWorthy: true,
        action: 'create',
        taskTitle: content.substring(0, 100),
        assignees: [],
        metadata: {},
        reasoning: 'Detected work-related keywords, using fallback parser'
      };
    }

    return {
      confidence: 0.5,
      isTaskWorthy: false,
      reasoning: 'Ambiguous message, defaulting to non-task'
    };
  }
}
