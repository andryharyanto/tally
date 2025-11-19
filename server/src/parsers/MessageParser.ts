import * as chrono from 'chrono-node';
import { ParsedTaskData, TaskStatus, TaskPriority } from '../../../shared/types';

export interface ParseResult extends ParsedTaskData {
  confidence: number; // 0-1 score indicating if this should be a task
  isTaskWorthy: boolean;
  suggestions?: string[];
  batchItems?: string[];
}

export class MessageParser {
  // Non-task phrases (conversational, not work-related)
  private static NON_TASK_PATTERNS = [
    /^(?:hi|hello|hey|good morning|good afternoon|thanks|thank you|ok|okay|sure|yes|no|maybe)\b/i,
    /^(?:how are you|what's up|how's it going)/i,
    /^\?$/,
    /^(?:lol|haha|hehe|:?\)|:?\()/i,
  ];

  // Strong task indicators
  private static TASK_INDICATORS = [
    /\b(?:invoice|payment|reconcil|budget|forecast|model|vendor|contract|report|analysis|review)\b/i,
    /\b(?:INV-\d+|PO-\d+)\b/i, // Invoice/PO numbers
    /\$\d+/i, // Money amounts
    /\b(?:need to|have to|must|should|will|going to)\b/i,
    /\b(?:by|due|deadline|before|after)\s+(?:today|tomorrow|friday|monday|week|month)/i,
  ];

  // Action patterns with confidence weights
  private static ACTION_PATTERNS = {
    create: {
      patterns: [
        /^(?:create|created|add|added|start|started|begin|began|working on|generated?|processing|need to|have to|must)\s+(.+)/i,
      ],
      confidence: 0.85
    },
    update: {
      patterns: [
        /^(?:update|updated|change|changed|modify|modified|revise|revised)\s+(.+)/i,
      ],
      confidence: 0.8
    },
    complete: {
      patterns: [
        /^(?:complete|completed|done|finished|closed|shipped|delivered)\s+(.+)/i,
        /^(.+?)\s+(?:is\s+)?(?:complete|done|finished)$/i
      ],
      confidence: 0.9
    },
    block: {
      patterns: [
        /^(?:blocked?|stuck|waiting|waiting on|waiting for)\s+(?:on\s+)?(.+)/i,
        /^(.+?)\s+(?:is\s+)?(?:blocked|stuck)(?:\s+(?:on|by)\s+(.+))?$/i
      ],
      confidence: 0.85
    },
    handoff: {
      patterns: [
        /^(?:pass|passing|hand|handing|assign|assigning|transfer|transferring)\s+(.+?)\s+to\s+(.+)/i,
        /^(?:give|giving)\s+(.+?)\s+to\s+(.+)/i
      ],
      confidence: 0.9
    },
    comment: {
      patterns: [
        /^(?:note|fyi|update|heads up|btw)[:]\s*(.+)/i
      ],
      confidence: 0.3
    }
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

  static parse(content: string, users: Array<{ id: string; name: string }>): ParseResult {
    const result: ParseResult = {
      confidence: 0,
      isTaskWorthy: false
    };

    // Check if message is obviously not a task
    if (this.isNonTask(content)) {
      result.confidence = 0.1;
      result.isTaskWorthy = false;
      return result;
    }

    // Detect action type and get confidence
    const { action, confidence: actionConfidence } = this.detectActionWithConfidence(content);
    result.action = action;
    result.confidence = actionConfidence;

    // Boost confidence if task indicators are present
    const taskIndicatorBoost = this.calculateTaskIndicatorBoost(content);
    result.confidence = Math.min(1, result.confidence + taskIndicatorBoost);

    // Determine if task-worthy (threshold: 0.6)
    result.isTaskWorthy = result.confidence >= 0.6;

    // Only extract details if task-worthy
    if (result.isTaskWorthy) {
      // Check for batch operations
      const batchItems = this.detectBatchItems(content);
      if (batchItems.length > 1) {
        result.batchItems = batchItems;
        result.suggestions = [`Create ${batchItems.length} separate tasks?`, 'Create one grouped task?'];
      }

      // Extract task title
      result.taskTitle = this.extractTaskTitle(content, action);

      // Extract assignees
      result.assignees = this.extractAssignees(content, users);

      // Extract deadline
      const deadline = this.extractDeadline(content);
      if (deadline) {
        result.deadline = deadline;
      }

      // Extract status
      const status = this.extractStatus(content);
      if (status) {
        result.status = status;
      }

      // Extract priority
      const priority = this.extractPriority(content);
      if (priority) {
        result.priority = priority;
      }

      // Detect workflow type
      const workflowType = this.detectWorkflowType(content);
      if (workflowType) {
        result.workflowType = workflowType;
      }

      // Extract blocker information
      if (action === 'block') {
        result.blockedBy = this.extractBlocker(content);
      }

      // Extract workflow-specific metadata
      result.metadata = this.extractMetadata(content, workflowType);
    }

    return result;
  }

  private static isNonTask(content: string): boolean {
    return this.NON_TASK_PATTERNS.some(pattern => pattern.test(content.trim()));
  }

  private static calculateTaskIndicatorBoost(content: string): number {
    let boost = 0;
    for (const indicator of this.TASK_INDICATORS) {
      if (indicator.test(content)) {
        boost += 0.1;
      }
    }
    return Math.min(0.3, boost); // Max 0.3 boost
  }

  private static detectBatchItems(content: string): string[] {
    // Detect multiple items mentioned with "and", commas, or semicolons
    const items: string[] = [];

    // Pattern: "invoices for Acme and TechCorp"
    const companyPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:and|,)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
    let match;
    while ((match = companyPattern.exec(content)) !== null) {
      items.push(match[1], match[2]);
    }

    // Pattern: "INV-123, INV-124, INV-125"
    const invoicePattern = /(INV-\d+)(?:\s*,\s*|\s+and\s+)(INV-\d+)/gi;
    while ((match = invoicePattern.exec(content)) !== null) {
      items.push(match[1], match[2]);
    }

    return [...new Set(items)]; // Remove duplicates
  }

  private static detectActionWithConfidence(content: string): { action: ParsedTaskData['action'], confidence: number } {
    // Check for explicit action patterns
    for (const [action, config] of Object.entries(this.ACTION_PATTERNS)) {
      for (const pattern of config.patterns) {
        if (pattern.test(content)) {
          return {
            action: action as ParsedTaskData['action'],
            confidence: config.confidence
          };
        }
      }
    }

    // Default to create with low confidence
    return { action: 'create', confidence: 0.5 };
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
