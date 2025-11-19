import db from './database';
import { User } from '../../../shared/types';

export class UserModel {
  static create(user: Omit<User, 'createdAt'>): User {
    const createdAt = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, avatar, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(user.id, user.name, user.email, user.avatar || null, createdAt);

    return { ...user, createdAt };
  }

  static findById(id: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      avatar: row.avatar,
      createdAt: row.created_at
    };
  }

  static findByEmail(email: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email) as any;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      avatar: row.avatar,
      createdAt: row.created_at
    };
  }

  static findAll(): User[] {
    const stmt = db.prepare('SELECT * FROM users ORDER BY name');
    const rows = stmt.all() as any[];

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      avatar: row.avatar,
      createdAt: row.created_at
    }));
  }

  static update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
    const current = this.findById(id);
    if (!current) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(updates.avatar);
    }

    if (fields.length === 0) return current;

    values.push(id);
    const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.findById(id);
  }
}
