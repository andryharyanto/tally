import db from './database';

export interface TaskNameCorrection {
  id: string;
  originalTitle: string;
  correctedTitle: string;
  workflowType: string;
  originalTags?: string[];
  correctedTags?: string[];
  userMessage: string;
  createdAt: string;
}

export class TaskNameLearningModel {
  static create(correction: Omit<TaskNameCorrection, 'createdAt'>): TaskNameCorrection {
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO task_name_corrections (
        id, original_title, corrected_title, workflow_type,
        original_tags, corrected_tags, user_message, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      correction.id,
      correction.originalTitle,
      correction.correctedTitle,
      correction.workflowType,
      JSON.stringify(correction.originalTags || []),
      JSON.stringify(correction.correctedTags || []),
      correction.userMessage,
      now
    );

    return { ...correction, createdAt: now };
  }

  static findAll(): TaskNameCorrection[] {
    const stmt = db.prepare('SELECT * FROM task_name_corrections ORDER BY created_at DESC');
    const rows = stmt.all() as any[];
    return rows.map(row => this.rowToCorrection(row));
  }

  static findByWorkflowType(workflowType: string): TaskNameCorrection[] {
    const stmt = db.prepare('SELECT * FROM task_name_corrections WHERE workflow_type = ? ORDER BY created_at DESC LIMIT 10');
    const rows = stmt.all(workflowType) as any[];
    return rows.map(row => this.rowToCorrection(row));
  }

  static getRecentCorrections(limit = 20): TaskNameCorrection[] {
    const stmt = db.prepare('SELECT * FROM task_name_corrections ORDER BY created_at DESC LIMIT ?');
    const rows = stmt.all(limit) as any[];
    return rows.map(row => this.rowToCorrection(row));
  }

  static getLearningPatterns(): {
    namingPatterns: string[];
    taggingPatterns: string[];
  } {
    const corrections = this.getRecentCorrections(50);

    const namingPatterns = corrections
      .filter(c => c.originalTitle !== c.correctedTitle)
      .map(c => `"${c.originalTitle}" → "${c.correctedTitle}"`);

    const taggingPatterns = corrections
      .filter(c => c.correctedTags && c.correctedTags.length > 0)
      .map(c => `${c.correctedTitle}: [${c.correctedTags!.join(', ')}]`);

    return {
      namingPatterns: namingPatterns.slice(0, 10),
      taggingPatterns: taggingPatterns.slice(0, 10)
    };
  }

  private static rowToCorrection(row: any): TaskNameCorrection {
    return {
      id: row.id,
      originalTitle: row.original_title,
      correctedTitle: row.corrected_title,
      workflowType: row.workflow_type,
      originalTags: JSON.parse(row.original_tags || '[]'),
      correctedTags: JSON.parse(row.corrected_tags || '[]'),
      userMessage: row.user_message,
      createdAt: row.created_at
    };
  }
}
