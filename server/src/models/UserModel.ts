import { getDatabase, saveDatabase } from '../database';
import { queryOne, queryAll } from '../database/query';
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
  is_active: number;
  role: string;
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
      [data.stepik_id ?? null, data.email, data.first_name, data.last_name]
    );
    const id = db.exec('SELECT last_insert_rowid()')[0]?.values[0][0] as number;
    return this.findById(id)!;
  }

  findOrCreateByStepik(stepikData: { id: number; email: string; first_name: string; last_name: string }): UserData {
    let user = this.findByStepikId(stepikData.id);
    if (!user) {
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

  exportData(userId: number): Record<string, unknown> {
    return {
      user: this.findById(userId),
      enterprises: queryAll('SELECT * FROM enterprises WHERE owner_id = ?', [userId]),
      decisions: queryAll('SELECT * FROM decisions WHERE user_id = ?', [userId]),
      gameEvents: queryAll('SELECT * FROM game_events WHERE user_id = ?', [userId]),
      economicSnapshots: queryAll('SELECT * FROM economic_snapshots WHERE user_id = ?', [userId]),
      progressLog: queryAll('SELECT * FROM game_progress_log WHERE user_id = ?', [userId]),
    };
  }

  deleteById(userId: number): void {
    const db = getDatabase();
    const tables: { table: string; column: string }[] = [
      { table: 'stepik_tokens', column: 'user_id' },
      { table: 'enterprises', column: 'owner_id' },
      { table: 'decisions', column: 'user_id' },
      { table: 'game_events', column: 'user_id' },
      { table: 'economic_snapshots', column: 'user_id' },
      { table: 'user_achievements', column: 'user_id' },
      { table: 'game_progress_log', column: 'user_id' },
      { table: 'decision_cooldowns', column: 'user_id' },
    ];
    for (const { table, column } of tables) {
      db.run(`DELETE FROM ${table} WHERE ${column} = ?`, [userId]);
    }
    db.run('DELETE FROM users WHERE id = ?', [userId]);
    saveDatabase();
    logger.info(`Deleted user ${userId} and associated data`);
  }
}
