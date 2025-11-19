import db from './database';
import { Message, ParsedTaskData } from '../../../shared/types';

export class MessageModel {
  static create(message: Omit<Message, 'timestamp'>): Message {
    const timestamp = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO messages (id, user_id, user_name, content, timestamp, parsed_data, related_task_ids)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      message.id,
      message.userId,
      message.userName,
      message.content,
      timestamp,
      message.parsedData ? JSON.stringify(message.parsedData) : null,
      message.relatedTaskIds ? JSON.stringify(message.relatedTaskIds) : null
    );

    return { ...message, timestamp };
  }

  static findById(id: string): Message | null {
    const stmt = db.prepare('SELECT * FROM messages WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return this.rowToMessage(row);
  }

  static findAll(limit: number = 100, offset: number = 0): Message[] {
    const stmt = db.prepare('SELECT * FROM messages ORDER BY timestamp DESC LIMIT ? OFFSET ?');
    const rows = stmt.all(limit, offset) as any[];

    return rows.map(row => this.rowToMessage(row));
  }

  static findRecent(limit: number = 50): Message[] {
    return this.findAll(limit, 0);
  }

  private static rowToMessage(row: any): Message {
    return {
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      content: row.content,
      timestamp: row.timestamp,
      parsedData: row.parsed_data ? JSON.parse(row.parsed_data) : undefined,
      relatedTaskIds: row.related_task_ids ? JSON.parse(row.related_task_ids) : undefined
    };
  }
}
