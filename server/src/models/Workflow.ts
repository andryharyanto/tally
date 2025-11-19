import db from './database';
import { Workflow, WorkflowStage, WorkflowField } from '../../../shared/types';

export class WorkflowModel {
  static create(workflow: Omit<Workflow, 'createdAt' | 'updatedAt'>): Workflow {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO workflows (id, name, description, stages, fields, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      workflow.id,
      workflow.name,
      workflow.description,
      JSON.stringify(workflow.stages),
      JSON.stringify(workflow.fields),
      now,
      now
    );

    return { ...workflow, createdAt: now, updatedAt: now };
  }

  static findById(id: string): Workflow | null {
    const stmt = db.prepare('SELECT * FROM workflows WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return this.rowToWorkflow(row);
  }

  static findByName(name: string): Workflow | null {
    const stmt = db.prepare('SELECT * FROM workflows WHERE name = ?');
    const row = stmt.get(name) as any;

    if (!row) return null;

    return this.rowToWorkflow(row);
  }

  static findAll(): Workflow[] {
    const stmt = db.prepare('SELECT * FROM workflows ORDER BY name');
    const rows = stmt.all() as any[];

    return rows.map(row => this.rowToWorkflow(row));
  }

  static update(id: string, updates: Partial<Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>>): Workflow | null {
    const current = this.findById(id);
    if (!current) return null;

    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [new Date().toISOString()];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.stages !== undefined) {
      fields.push('stages = ?');
      values.push(JSON.stringify(updates.stages));
    }
    if (updates.fields !== undefined) {
      fields.push('fields = ?');
      values.push(JSON.stringify(updates.fields));
    }

    values.push(id);
    const stmt = db.prepare(`UPDATE workflows SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.findById(id);
  }

  static delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM workflows WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private static rowToWorkflow(row: any): Workflow {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      stages: JSON.parse(row.stages),
      fields: JSON.parse(row.fields),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
