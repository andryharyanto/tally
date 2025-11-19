import Anthropic from '@anthropic-ai/sdk';
import * as chrono from 'chrono-node';
import { ParsedTaskData, TaskStatus, TaskPriority } from '../../../shared/types';

export interface ParseResult extends ParsedTaskData {
  confidence: number;
  isTaskWorthy: boolean;
  suggestions?: string[];
  batchItems?: string[];
  reasoning?: string;
  messageType?: 'task' | 'comment' | 'question' | 'observation' | 'conversation';
  taskReference?: string; // Keywords to find related task
  commentText?: string; // Comment to add to existing task
  newTaskTitle?: string; // New title for rename action
  newTags?: string[]; // New tags for retag action
}

interface TaskExtractionTool {
  isTask: boolean;
  confidence: number;
  messageType: 'task' | 'comment' | 'question' | 'observation' | 'conversation';
  action?: 'create' | 'update' | 'complete' | 'block' | 'handoff' | 'comment' | 'rename' | 'retag';
  taskTitle?: string;
  taskReference?: string;
  commentText?: string;
  newTaskTitle?: string;
  newTags?: string[];
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
    conversationContext?: string[],
    recentTasks?: Array<{ id: string; title: string; status: string }>
  ): Promise<ParseResult> {
    try {
      const client = this.getClient();

      const userList = users.map(u => u.name).join(', ');
      const contextStr = conversationContext && conversationContext.length > 0
        ? `\n\nRecent conversation:\n${conversationContext.join('\n')}`
        : '';

      const tasksStr = recentTasks && recentTasks.length > 0
        ? `\n\nRecent active tasks:\n${recentTasks.map(t => `- "${t.title}" (${t.status})`).join('\n')}`
        : '';

      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        tools: [{
          name: 'extract_task_info',
          description: 'Analyzes a message in a finance team chat to determine intent and extract task information. Understands nuances like questions, comments, observations, and actual work items.',
          input_schema: {
            type: 'object',
            properties: {
              isTask: {
                type: 'boolean',
                description: 'Whether this requires tracking (new task, update, or comment on existing work). False for general questions, observations, or casual conversation.'
              },
              confidence: {
                type: 'number',
                description: 'Confidence score from 0.0 to 1.0. Use low scores (0.1-0.3) for vague/unclear messages, medium (0.4-0.6) for possible tasks, high (0.7-1.0) for clear actionable work.'
              },
              messageType: {
                type: 'string',
                enum: ['task', 'comment', 'question', 'observation', 'conversation'],
                description: 'task=new work to create/complete, comment=note about existing task, question=asking for help/clarification, observation=noting an issue, conversation=casual chat'
              },
              action: {
                type: 'string',
                enum: ['create', 'update', 'complete', 'block', 'handoff', 'comment', 'rename', 'retag'],
                description: 'The action: create=new task, update=modify existing, complete=mark done, block=mark as blocked, handoff=reassign, comment=add note, rename=change task title, retag=change task tags'
              },
              taskTitle: {
                type: 'string',
                description: 'Clear, concise title for NEW tasks. Omit for comments/questions about existing tasks.'
              },
              taskReference: {
                type: 'string',
                description: 'For comments/questions/updates: keywords from the task being referenced (e.g., "Humana invoice", "TechCorp payment", "October close")'
              },
              commentText: {
                type: 'string',
                description: 'For comments/questions/observations: the actual comment text to add to the related task'
              },
              newTaskTitle: {
                type: 'string',
                description: 'For rename action: the new title the user wants for the task'
              },
              newTags: {
                type: 'array',
                items: { type: 'string' },
                description: 'For retag action: the new tags the user wants for the task'
              },
              assigneeNames: {
                type: 'array',
                items: { type: 'string' },
                description: 'Names of people assigned or mentioned'
              },
              deadline: {
                type: 'string',
                description: 'Natural language deadline if mentioned (e.g., "tomorrow", "Friday", "October 31")'
              },
              status: {
                type: 'string',
                enum: ['todo', 'in_progress', 'blocked', 'completed', 'cancelled'],
                description: 'Task status'
              },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent'],
                description: 'Priority level'
              },
              workflowType: {
                type: 'string',
                description: 'invoice-generation, payment-reconciliation, monthly-close, annual-planning, model-change, vendor-onboarding, or general'
              },
              blockedBy: {
                type: 'string',
                description: 'What is blocking this task if blocked'
              },
              batchItems: {
                type: 'array',
                items: { type: 'string' },
                description: 'If multiple items mentioned (e.g., "invoices for Acme and TechCorp"), list them separately'
              },
              metadata: {
                type: 'object',
                description: 'Finance metadata: invoiceNumber, customerName, amount, etc.'
              },
              reasoning: {
                type: 'string',
                description: 'Brief explanation of your classification'
              }
            },
            required: ['isTask', 'confidence', 'messageType', 'reasoning']
          }
        }],
        messages: [{
          role: 'user',
          content: `You are analyzing a message in a finance team's task tracker chat. Your job is to understand INTENT and NUANCE.

Context:
- Team members: ${userList}
- Finance workflows: invoice generation, payment reconciliation, monthly close, annual planning, model change control, vendor onboarding${contextStr}${tasksStr}

Analyze this message:
"${content}"

IMPORTANT GUIDANCE:

1. MESSAGE TYPES:
   - **task**: Clear actionable work ("I'm starting the Humana invoice", "Generate TechCorp invoice")
   - **comment**: Observation about existing work ("the invoice has some issues", "this looks good")
   - **question**: Asking for help ("how can I not do this?", "what's the amount?", "is this ready?")
   - **observation**: Noting a problem without clear action ("will have some issue", "something seems off")
   - **conversation**: Casual chat ("hey", "thanks", "good morning")

2. VAGUE MESSAGES (give LOW confidence 0.1-0.3):
   - "combine the invoice with october" - UNCLEAR what action to take
   - "the invoice" - INCOMPLETE, no action
   - Missing critical details (what invoice? do what?)

3. OBSERVATIONS vs TASKS:
   - "invoice will have some issue" → observation (0.3) or question if asking for help
   - "fix the invoice issue" → task (0.9)

4. QUESTIONS ABOUT WORK:
   - "how can I not do this?" → question about existing work (0.5)
   - Use taskReference to link to related task
   - Set commentText to the question itself

5. COMMENTS ON EXISTING WORK:
   - If referencing existing work, use messageType='comment'
   - Set taskReference with keywords to find the task
   - Put the actual comment in commentText

6. CLEAR TASKS (high confidence 0.8-1.0):
   - "I am starting Humana Invoice October 2025" ✓
   - "Generated invoice for TechCorp $25k" ✓
   - "Blocked on payment from Acme" ✓

7. RENAME/RETAG ACTIONS:
   - "rename the Humana invoice to Humana Q4 Invoice" → task/rename, taskReference: "Humana invoice", newTaskTitle: "Humana Q4 Invoice"
   - "tag the TechCorp payment as urgent and high-value" → task/retag, taskReference: "TechCorp payment", newTags: ["urgent", "high-value"]
   - "change the title to October Financial Close" → task/rename, newTaskTitle: "October Financial Close"

Examples:
- "hey how are you" → conversation, confidence: 0.05
- "I am starting Humana Invoice October 2025" → task/create, confidence: 0.95
- "combine the invoice with october" → observation, confidence: 0.2 (too vague)
- "invoice will have some issue" → observation, confidence: 0.3
- "how can I not do this?" → question, confidence: 0.5, taskReference from context
- "the TechCorp invoice looks wrong" → comment, confidence: 0.7, taskReference: "TechCorp invoice"
- "Waiting on Acme payment" → task/block, confidence: 0.9

Be strict: Only high confidence (0.7+) for clear, actionable work with enough details.`
        }]
      });

      // Extract tool use response
      const toolUse = response.content.find(c => c.type === 'tool_use');
      if (!toolUse || toolUse.type !== 'tool_use') {
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
        messageType: extracted.messageType,
        action: extracted.action,
        taskTitle: extracted.taskTitle,
        taskReference: extracted.taskReference,
        commentText: extracted.commentText,
        newTaskTitle: extracted.newTaskTitle,
        newTags: extracted.newTags,
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
        messageType: 'conversation',
        reasoning: 'Detected as conversational greeting/acknowledgment'
      };
    }

    // Simple task detection
    const hasWorkKeywords = /\b(invoice|payment|reconcil|budget|complete|finish|start|starting|generate)\b/i.test(content);

    if (hasWorkKeywords) {
      const hasAction = /\b(start|starting|begin|create|generate|finish|complete)\b/i.test(content);

      return {
        confidence: hasAction ? 0.7 : 0.5,
        isTaskWorthy: hasAction,
        messageType: hasAction ? 'task' : 'observation',
        action: hasAction ? 'create' : 'comment',
        taskTitle: hasAction ? content.substring(0, 100) : undefined,
        commentText: hasAction ? undefined : content,
        assignees: [],
        metadata: {},
        reasoning: 'Detected work-related keywords, using fallback parser'
      };
    }

    return {
      confidence: 0.3,
      isTaskWorthy: false,
      messageType: 'observation',
      reasoning: 'Ambiguous message, defaulting to non-task'
    };
  }
}
