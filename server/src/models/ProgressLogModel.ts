import { getDatabase } from '../database';
import { queryAll } from '../database/query';

export interface ProgressLogEntry {
  id: number;
  user_id: number;
  event_type: string;
  payload: string;
  created_at: string;
}

export class ProgressLogModel {
  log(userId: number, eventType: string, payload: Record<string, unknown>): void {
    const db = getDatabase();
    db.run(
      'INSERT INTO game_progress_log (user_id, event_type, payload) VALUES (?, ?, ?)',
      [userId, eventType, JSON.stringify(payload)]
    );
  }

  findByUser(userId: number, limit = 50): ProgressLogEntry[] {
    return queryAll<ProgressLogEntry>(
      'SELECT * FROM game_progress_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );
  }
}
