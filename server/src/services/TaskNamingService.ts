import { v4 as uuidv4 } from 'uuid';
import { TaskNameLearningModel } from '../models/TaskNameLearning';

export interface TaskNamingResult {
  enhancedTitle: string;
  tags: string[];
  reasoning: string;
}

export class TaskNamingService {
  private static taskCounters: Map<string, number> = new Map();

  /**
   * Enhance a raw task title with smart naming conventions and auto-generated tags
   */
  static enhanceTaskName(
    rawTitle: string,
    workflowType: string,
    metadata: Record<string, any>
  ): TaskNamingResult {
    let learningPatterns: { namingPatterns: string[]; taggingPatterns: string[] } = {
      namingPatterns: [],
      taggingPatterns: []
    };

    try {
      learningPatterns = TaskNameLearningModel.getLearningPatterns();
    } catch (error) {
      console.error('Error loading learning patterns:', error);
      // Continue without learning patterns
    }

    // Generate task ID based on workflow
    const taskId = this.generateTaskId(workflowType);

    // Apply workflow-specific naming patterns
    let enhancedTitle = rawTitle;
    const tags: string[] = [];

    switch (workflowType) {
      case 'invoice-generation':
        enhancedTitle = this.enhanceInvoiceName(rawTitle, metadata, taskId);
        tags.push('invoice', 'billing');
        if (metadata.customerName) tags.push(metadata.customerName.toLowerCase());
        if (metadata.amount && metadata.amount > 50000) tags.push('high-value');
        break;

      case 'payment-reconciliation':
        enhancedTitle = this.enhancePaymentName(rawTitle, metadata, taskId);
        tags.push('payment', 'reconciliation');
        if (metadata.invoiceNumber) tags.push(metadata.invoiceNumber.toLowerCase());
        break;

      case 'monthly-close':
        enhancedTitle = this.enhanceMonthlyCloseName(rawTitle, metadata, taskId);
        tags.push('monthly-close', 'financial-reporting');
        if (metadata.month) tags.push(metadata.month.toLowerCase());
        break;

      case 'annual-planning':
        enhancedTitle = this.enhanceAnnualPlanningName(rawTitle, metadata, taskId);
        tags.push('planning', 'annual', 'budgeting');
        if (metadata.year) tags.push(`fy${metadata.year}`);
        break;

      case 'model-change':
        enhancedTitle = this.enhanceModelChangeName(rawTitle, metadata, taskId);
        tags.push('model', 'change-control');
        if (metadata.version) tags.push(`v${metadata.version}`);
        break;

      case 'vendor-onboarding':
        enhancedTitle = this.enhanceVendorName(rawTitle, metadata, taskId);
        tags.push('vendor', 'onboarding');
        if (metadata.category) tags.push(metadata.category.toLowerCase());
        break;

      default:
        enhancedTitle = `${taskId}: ${rawTitle}`;
        tags.push('general');
    }

    // Add month tags in YYYY-MM format for temporal workflows
    const monthTag = this.extractMonthTag(metadata, rawTitle);
    if (monthTag) {
      tags.push(monthTag);
    }

    // Apply learning from past corrections
    enhancedTitle = this.applyLearning(enhancedTitle, workflowType, learningPatterns);

    return {
      enhancedTitle,
      tags: [...new Set(tags)], // Remove duplicates
      reasoning: `Auto-enhanced with ${taskId} and ${tags.length} tags based on ${workflowType} workflow`
    };
  }

  private static generateTaskId(workflowType: string): string {
    const prefix = this.getWorkflowPrefix(workflowType);
    const counter = (this.taskCounters.get(workflowType) || 0) + 1;
    this.taskCounters.set(workflowType, counter);
    return `${prefix}-${String(counter).padStart(4, '0')}`;
  }

  private static getWorkflowPrefix(workflowType: string): string {
    const prefixMap: Record<string, string> = {
      'invoice-generation': 'INV',
      'payment-reconciliation': 'PAY',
      'monthly-close': 'CLOSE',
      'annual-planning': 'PLAN',
      'model-change': 'MODEL',
      'vendor-onboarding': 'VENDOR',
      'general': 'TASK'
    };
    return prefixMap[workflowType] || 'TASK';
  }

  private static enhanceInvoiceName(
    rawTitle: string,
    metadata: Record<string, any>,
    taskId: string
  ): string {
    const customer = metadata.customerName || 'Unknown';
    const amount = metadata.amount ? `$${metadata.amount.toLocaleString()}` : '';
    const invoiceNum = metadata.invoiceNumber || '';

    if (invoiceNum) {
      return `${taskId}: ${invoiceNum} - ${customer} ${amount}`.trim();
    }
    return `${taskId}: ${customer} Invoice ${amount}`.trim();
  }

  private static enhancePaymentName(
    rawTitle: string,
    metadata: Record<string, any>,
    taskId: string
  ): string {
    const invoiceNum = metadata.invoiceNumber || '';
    const amount = metadata.amount ? `$${metadata.amount.toLocaleString()}` : '';

    if (invoiceNum) {
      return `${taskId}: Reconcile ${invoiceNum} ${amount}`.trim();
    }
    return `${taskId}: ${rawTitle}`;
  }

  private static enhanceMonthlyCloseName(
    rawTitle: string,
    metadata: Record<string, any>,
    taskId: string
  ): string {
    const month = metadata.month || '';
    const year = metadata.year || new Date().getFullYear();

    if (month) {
      return `${taskId}: ${month} ${year} Financial Close`;
    }
    return `${taskId}: ${rawTitle}`;
  }

  private static enhanceAnnualPlanningName(
    rawTitle: string,
    metadata: Record<string, any>,
    taskId: string
  ): string {
    const year = metadata.year || new Date().getFullYear() + 1;
    const dept = metadata.department || '';

    if (dept) {
      return `${taskId}: FY${year} ${dept} Budget Planning`;
    }
    return `${taskId}: FY${year} Annual Plan`;
  }

  private static enhanceModelChangeName(
    rawTitle: string,
    metadata: Record<string, any>,
    taskId: string
  ): string {
    const version = metadata.version || '';
    const modelName = metadata.modelName || '';

    if (version && modelName) {
      return `${taskId}: ${modelName} v${version}`;
    }
    return `${taskId}: ${rawTitle}`;
  }

  private static enhanceVendorName(
    rawTitle: string,
    metadata: Record<string, any>,
    taskId: string
  ): string {
    const vendorName = metadata.vendorName || '';
    const category = metadata.category || '';

    if (vendorName) {
      return `${taskId}: Onboard ${vendorName}${category ? ` (${category})` : ''}`;
    }
    return `${taskId}: ${rawTitle}`;
  }

  private static applyLearning(
    title: string,
    workflowType: string,
    learningPatterns: { namingPatterns: string[]; taggingPatterns: string[] }
  ): string {
    // In future: Use learning patterns to adjust naming
    // For now, just return the title
    // Could implement ML-based naming here
    return title;
  }

  /**
   * Record a user correction for future learning
   */
  static recordCorrection(
    originalTitle: string,
    correctedTitle: string,
    workflowType: string,
    originalTags: string[],
    correctedTags: string[],
    userMessage: string
  ): void {
    try {
      TaskNameLearningModel.create({
        id: uuidv4(),
        originalTitle,
        correctedTitle,
        workflowType,
        originalTags,
        correctedTags,
        userMessage
      });
    } catch (error) {
      console.error('Error recording correction:', error);
      // Don't fail the operation if learning fails
    }
  }

  /**
   * Get suggestions for improving a task name based on learning
   */
  static getSuggestions(taskTitle: string, workflowType: string): string[] {
    try {
      const corrections = TaskNameLearningModel.findByWorkflowType(workflowType);
      const suggestions: string[] = [];

      // Find similar corrections
      for (const correction of corrections) {
        const similarity = this.calculateSimilarity(taskTitle, correction.originalTitle);
        if (similarity > 0.5) {
          suggestions.push(`Consider: "${correction.correctedTitle}" (based on similar past correction)`);
        }
      }

      return suggestions.slice(0, 3);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    const common = words1.filter(w => words2.includes(w));
    return common.length / Math.max(words1.length, words2.length);
  }

  /**
   * Extract month tag in YYYY-MM format from metadata or title
   */
  private static extractMonthTag(metadata: Record<string, any>, rawTitle: string): string | null {
    const monthNames: Record<string, string> = {
      'january': '01', 'jan': '01',
      'february': '02', 'feb': '02',
      'march': '03', 'mar': '03',
      'april': '04', 'apr': '04',
      'may': '05',
      'june': '06', 'jun': '06',
      'july': '07', 'jul': '07',
      'august': '08', 'aug': '08',
      'september': '09', 'sep': '09', 'sept': '09',
      'october': '10', 'oct': '10',
      'november': '11', 'nov': '11',
      'december': '12', 'dec': '12'
    };

    let year: number | null = null;
    let monthNum: string | null = null;

    // Try to get from metadata first
    if (metadata.year) {
      year = parseInt(String(metadata.year));
    }

    if (metadata.month) {
      const monthStr = String(metadata.month).toLowerCase().trim();
      // Check if it's a month name or abbreviation
      if (monthNames[monthStr]) {
        monthNum = monthNames[monthStr];
      } else {
        // Try to parse as number
        const parsed = parseInt(monthStr);
        if (parsed >= 1 && parsed <= 12) {
          monthNum = String(parsed).padStart(2, '0');
        }
      }
    }

    // If we don't have complete info, try to parse from title
    if (!year || !monthNum) {
      const titleLower = rawTitle.toLowerCase();

      // Look for year (4 digits)
      const yearMatch = titleLower.match(/\b(20\d{2})\b/);
      if (yearMatch && !year) {
        year = parseInt(yearMatch[1]);
      }

      // Look for month names in title
      if (!monthNum) {
        for (const [name, num] of Object.entries(monthNames)) {
          if (titleLower.includes(name)) {
            monthNum = num;
            break;
          }
        }
      }
    }

    // If we have both year and month, return formatted tag
    if (year && monthNum) {
      return `${year}-${monthNum}`;
    }

    // Fallback: if we only have a year but no month, check if it's in metadata.dueDate
    if (metadata.dueDate) {
      try {
        const date = new Date(metadata.dueDate);
        if (!isNaN(date.getTime())) {
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }
      } catch (e) {
        // Ignore date parsing errors
      }
    }

    return null;
  }
}
