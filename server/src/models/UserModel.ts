import { getDatabase } from '../database';
import { logger } from '../utils/logger';

export interface UserData {
  id: number;
  stepik_id: number | null;
  email: string;
  first_name: string;
  last_name: string;
  level: number;
  experience: number;
  current_period: string;
  unlocked_features: string;
  created_at: string;
  last_login: string;
}

function queryOne<T>(sql: string, params: any[] = []): T | undefined {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const cols = stmt.getColumnNames();
    const values = stmt.get();
    const row: any = {};
    cols.forEach((col, i) => { row[col] = values[i]; });
    stmt.free();
    return row as T;
  }
  stmt.free();
  return undefined;
}

function queryAll<T>(sql: string, params: any[] = []): T[] {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    const cols = stmt.getColumnNames();
    const values = stmt.get();
    const row: any = {};
    cols.forEach((col, i) => { row[col] = values[i]; });
    results.push(row as T);
  }
  stmt.free();
  return results;
}

export class UserModel {
  findById(id: number): UserData | undefined {
    return queryOne<UserData>('SELECT * FROM users WHERE id = ?', [id]);
  }

  findByStepikId(stepikId: number): UserData | undefined {
    return queryOne<UserData>('SELECT * FROM users WHERE stepik_id = ?', [stepikId]);
  }

  create(data: { stepik_id?: number; email: string; first_name: string; last_name: string }): UserData {
    const db = getDatabase();
    db.run(
      'INSERT INTO users (stepik_id, email, first_name, last_name) VALUES (?, ?, ?, ?)',
      [data.stepik_id ?? null, data.email || 'unknown@thinkred.local', data.first_name || 'Пользователь', data.last_name || '']
    );
    const id = db.exec('SELECT last_insert_rowid()')[0]?.values[0][0] as number;
    return this.findById(id)!;
  }

  findOrCreateByStepik(stepikData: { id: number; email: string; first_name: string; last_name: string }): UserData {
    logger.info(`findOrCreateByStepik called with id=${stepikData.id}, email=${stepikData.email}, first=${stepikData.first_name}, last=${stepikData.last_name}`);
    let user = this.findByStepikId(stepikData.id);
    if (!user) {
      logger.info('User not found, creating new');
      user = this.create({
        stepik_id: stepikData.id,
        email: stepikData.email,
        first_name: stepikData.first_name,
        last_name: stepikData.last_name,
      });
      logger.info(`Created new user for Stepik ID ${stepikData.id}`);
    }
    return user;
  }

  updateProgress(userId: number, data: { level?: number; experience?: number; current_period?: string; unlocked_features?: string }) {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.level !== undefined) { fields.push('level = ?'); values.push(data.level); }
    if (data.experience !== undefined) { fields.push('experience = ?'); values.push(data.experience); }
    if (data.current_period !== undefined) { fields.push('current_period = ?'); values.push(data.current_period); }
    if (data.unlocked_features !== undefined) { fields.push('unlocked_features = ?'); values.push(data.unlocked_features); }

    if (fields.length === 0) return;

    values.push(userId);
    const db = getDatabase();
    db.run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  updateLastLogin(userId: number) {
    const db = getDatabase();
    db.run('UPDATE users SET last_login = datetime(\'now\') WHERE id = ?', [userId]);
  }
}
