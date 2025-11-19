import db from './database';
import { Task, TaskStatus, TaskPriority } from '../../../shared/types';

export class TaskModel {
  static create(task: Omit<Task, 'createdAt' | 'updatedAt'>): Task {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO tasks (
        id, title, description, status, priority, workflow_type,
        assignees, deadline, blocked_by, metadata, created_by,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      task.id,
      task.title,
      task.description || null,
      task.status,
      task.priority,
      task.workflowType,
      JSON.stringify(task.assignees),
      task.deadline || null,
      task.blockedBy || null,
      JSON.stringify(task.metadata),
      task.createdBy,
      now,
      now
    );

    return { ...task, createdAt: now, updatedAt: now };
  }

  static findById(id: string): Task | null {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return this.rowToTask(row);
  }

  static findAll(filters?: {
    workflowType?: string;
    status?: TaskStatus;
    assignee?: string;
  }): Task[] {
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];

    if (filters?.workflowType) {
      query += ' AND workflow_type = ?';
      params.push(filters.workflowType);
    }

    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters?.assignee) {
      query += ' AND assignees LIKE ?';
      params.push(`%"${filters.assignee}"%`);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => this.rowToTask(row));
  }

  static update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>): Task | null {
    const current = this.findById(id);
    if (!current) return null;

    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [new Date().toISOString()];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      values.push(updates.priority);
    }
    if (updates.workflowType !== undefined) {
      fields.push('workflow_type = ?');
      values.push(updates.workflowType);
    }
    if (updates.assignees !== undefined) {
      fields.push('assignees = ?');
      values.push(JSON.stringify(updates.assignees));
    }
    if (updates.deadline !== undefined) {
      fields.push('deadline = ?');
      values.push(updates.deadline);
    }
    if (updates.blockedBy !== undefined) {
      fields.push('blocked_by = ?');
      values.push(updates.blockedBy);
    }
    if (updates.metadata !== undefined) {
      fields.push('metadata = ?');
      values.push(JSON.stringify(updates.metadata));
    }

    values.push(id);
    const stmt = db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.findById(id);
  }

  static delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private static rowToTask(row: any): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status as TaskStatus,
      priority: row.priority as TaskPriority,
      workflowType: row.workflow_type,
      assignees: JSON.parse(row.assignees),
      deadline: row.deadline,
      blockedBy: row.blocked_by,
      metadata: JSON.parse(row.metadata),
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
