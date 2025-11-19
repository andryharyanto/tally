import * as chrono from 'chrono-node';
import { ParsedTaskData, TaskStatus, TaskPriority } from '../../../shared/types';

export class MessageParser {
  // Action patterns
  private static ACTION_PATTERNS = {
    create: [
      /^(?:create|created|add|added|start|started|begin|began|working on|generated?|processing|need to)\s+(.+)/i,
      /^(.+?)(?:\s+for\s+.+)?$/i // fallback: treat as new task
    ],
    update: [
      /^(?:update|updated|change|changed|modify|modified)\s+(.+)/i,
    ],
    complete: [
      /^(?:complete|completed|done|finished|closed)\s+(.+)/i,
      /^(.+?)\s+(?:is\s+)?(?:complete|done|finished)$/i
    ],
    block: [
      /^(?:blocked?|stuck|waiting|waiting on|waiting for)\s+(?:on\s+)?(.+)/i,
      /^(.+?)\s+(?:is\s+)?(?:blocked|stuck)(?:\s+(?:on|by)\s+(.+))?$/i
    ],
    handoff: [
      /^(?:pass|passing|hand|handing|assign|assigning|transfer|transferring)\s+(.+?)\s+to\s+(.+)/i,
      /^(?:give|giving)\s+(.+?)\s+to\s+(.+)/i
    ],
    comment: [
      /^(?:note|fyi|update|heads up|just|actually)[:]\s*(.+)/i
    ]
  };

  // Status keywords
  private static STATUS_KEYWORDS: Record<string, TaskStatus> = {
    'todo': 'todo',
    'to do': 'todo',
    'pending': 'todo',
    'in progress': 'in_progress',
    'working': 'in_progress',
    'active': 'in_progress',
    'blocked': 'blocked',
    'stuck': 'blocked',
    'waiting': 'blocked',
    'complete': 'completed',
    'completed': 'completed',
    'done': 'completed',
    'finished': 'completed',
    'cancelled': 'cancelled',
    'canceled': 'cancelled'
  };

  // Priority keywords
  private static PRIORITY_KEYWORDS: Record<string, TaskPriority> = {
    'urgent': 'urgent',
    'critical': 'urgent',
    'asap': 'urgent',
    'high': 'high',
    'important': 'high',
    'medium': 'medium',
    'normal': 'medium',
    'low': 'low',
    'minor': 'low'
  };

  // Workflow type detection
  private static WORKFLOW_PATTERNS: Record<string, RegExp[]> = {
    'invoice-generation': [
      /invoice|invoicing|billing|bill/i,
      /INV-\d+/i
    ],
    'payment-reconciliation': [
      /payment|reconcil|matching|paid|receipt/i,
      /bank|transaction/i
    ],
    'monthly-close': [
      /month(?:ly)?\s+close|close(?:ing)?\s+(?:the\s+)?month/i,
      /end\s+of\s+month|eom/i,
      /financial\s+close/i
    ],
    'vendor-onboarding': [
      /vendor|supplier/i,
      /onboard/i
    ],
    'model-change': [
      /model|forecast|budget/i,
      /change\s+control|version|approval/i
    ],
    'annual-planning': [
      /annual|yearly|year-end/i,
      /plan(?:ning)?|budget/i
    ]
  };

  static parse(content: string, users: Array<{ id: string; name: string }>): ParsedTaskData {
    const parsed: ParsedTaskData = {};

    // Detect action type
    parsed.action = this.detectAction(content);

    // Extract task title
    parsed.taskTitle = this.extractTaskTitle(content, parsed.action);

    // Extract assignees
    parsed.assignees = this.extractAssignees(content, users);

    // Extract deadline
    const deadline = this.extractDeadline(content);
    if (deadline) {
      parsed.deadline = deadline;
    }

    // Extract status
    const status = this.extractStatus(content);
    if (status) {
      parsed.status = status;
    }

    // Extract priority
    const priority = this.extractPriority(content);
    if (priority) {
      parsed.priority = priority;
    }

    // Detect workflow type
    const workflowType = this.detectWorkflowType(content);
    if (workflowType) {
      parsed.workflowType = workflowType;
    }

    // Extract blocker information
    if (parsed.action === 'block') {
      parsed.blockedBy = this.extractBlocker(content);
    }

    // Extract workflow-specific metadata
    parsed.metadata = this.extractMetadata(content, workflowType);

    return parsed;
  }

  private static detectAction(content: string): ParsedTaskData['action'] {
    // Check for explicit action patterns
    for (const [action, patterns] of Object.entries(this.ACTION_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          return action as ParsedTaskData['action'];
        }
      }
    }

    // Default to create
    return 'create';
  }

  private static extractTaskTitle(content: string, action?: string): string {
    // Remove common prefixes
    let title = content
      .replace(/^(?:create|created|add|added|start|started|begin|began|complete|completed|done|finished|update|updated|working on|blocked?|stuck|waiting|need to|generated?)\s+/i, '')
      .replace(/^(?:the\s+)?/i, '')
      .trim();

    // Clean up trailing phrases
    title = title
      .replace(/\s+(?:for|by|to|on)\s+(?:me|you|us|them)$/i, '')
      .replace(/\s+(?:today|tomorrow|this week|next week)$/i, '')
      .trim();

    // Limit length
    if (title.length > 200) {
      title = title.substring(0, 200) + '...';
    }

    return title || content.substring(0, 100);
  }

  private static extractAssignees(content: string, users: Array<{ id: string; name: string }>): string[] {
    const assignees: string[] = [];
    const lowerContent = content.toLowerCase();

    // Look for "to [name]" or "for [name]" or "@[name]"
    for (const user of users) {
      const lowerName = user.name.toLowerCase();
      const patterns = [
        new RegExp(`\\b(?:to|for|assign(?:ed)?\\s+to)\\s+${lowerName}\\b`, 'i'),
        new RegExp(`@${lowerName}\\b`, 'i'),
        new RegExp(`\\b${lowerName}\\b`, 'i') // fallback: just mention
      ];

      for (const pattern of patterns) {
        if (pattern.test(lowerContent) && !assignees.includes(user.id)) {
          assignees.push(user.id);
          break;
        }
      }
    }

    return assignees;
  }

  private static extractDeadline(content: string): string | undefined {
    // Use chrono-node to parse natural language dates
    const results = chrono.parse(content);

    if (results.length > 0) {
      // Get the first parsed date
      const date = results[0].start.date();
      return date.toISOString();
    }

    return undefined;
  }

  private static extractStatus(content: string): TaskStatus | undefined {
    const lowerContent = content.toLowerCase();

    for (const [keyword, status] of Object.entries(this.STATUS_KEYWORDS)) {
      if (lowerContent.includes(keyword)) {
        return status;
      }
    }

    return undefined;
  }

  private static extractPriority(content: string): TaskPriority | undefined {
    const lowerContent = content.toLowerCase();

    for (const [keyword, priority] of Object.entries(this.PRIORITY_KEYWORDS)) {
      if (lowerContent.includes(keyword)) {
        return priority;
      }
    }

    return undefined;
  }

  private static detectWorkflowType(content: string): string | undefined {
    const lowerContent = content.toLowerCase();

    for (const [workflowType, patterns] of Object.entries(this.WORKFLOW_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(lowerContent)) {
          return workflowType;
        }
      }
    }

    return undefined;
  }

  private static extractBlocker(content: string): string | undefined {
    // Extract what's blocking the task
    const blockPatterns = [
      /(?:blocked?|stuck|waiting)\s+(?:on|for|by)\s+(.+)/i,
      /(?:blocked?|stuck)(?:\s+because\s+|\s+-\s+|\s+:\s+)(.+)/i
    ];

    for (const pattern of blockPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private static extractMetadata(content: string, workflowType?: string): Record<string, any> {
    const metadata: Record<string, any> = {};

    if (!workflowType) return metadata;

    // Invoice-specific metadata
    if (workflowType === 'invoice-generation' || workflowType === 'payment-reconciliation') {
      // Extract invoice number
      const invoiceMatch = content.match(/INV-(\d+)/i);
      if (invoiceMatch) {
        metadata.invoiceNumber = invoiceMatch[0];
      }

      // Extract customer/company names (capitalized words)
      const companyMatches = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
      if (companyMatches && companyMatches.length > 0) {
        metadata.customerName = companyMatches[0];
      }

      // Extract amounts
      const amountMatch = content.match(/\$?([\d,]+(?:\.\d{2})?)/);
      if (amountMatch) {
        metadata.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      }

      // Check if paid
      if (/paid|received|cleared/i.test(content)) {
        metadata.paid = true;
      }
    }

    // Monthly close metadata
    if (workflowType === 'monthly-close') {
      const monthMatch = content.match(/(?:january|february|march|april|may|june|july|august|september|october|november|december)/i);
      if (monthMatch) {
        metadata.month = monthMatch[0];
      }

      const yearMatch = content.match(/\b(20\d{2})\b/);
      if (yearMatch) {
        metadata.year = parseInt(yearMatch[1]);
      }
    }

    // Model change metadata
    if (workflowType === 'model-change') {
      const versionMatch = content.match(/v(?:ersion)?\s*(\d+(?:\.\d+)*)/i);
      if (versionMatch) {
        metadata.version = versionMatch[1];
      }
    }

    return metadata;
  }
}
