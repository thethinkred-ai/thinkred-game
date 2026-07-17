import { getDatabase, saveDatabase } from '../database';
import { queryOne } from '../database/query';

export interface StepikTokenData {
  user_id: number;
  stepik_id: number;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  updated_at: string;
}

export class StepikTokenModel {
  upsert(data: {
    user_id: number;
    stepik_id: number;
    access_token: string;
    refresh_token: string;
    expires_at: string;
  }): void {
    const db = getDatabase();
    db.run(`
      INSERT INTO stepik_tokens (user_id, stepik_id, access_token, refresh_token, expires_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        stepik_id = excluded.stepik_id,
        access_token = excluded.access_token,
        refresh_token = excluded.refresh_token,
        expires_at = excluded.expires_at,
        updated_at = datetime('now')
    `, [data.user_id, data.stepik_id, data.access_token, data.refresh_token, data.expires_at]);
    saveDatabase();
  }

  findByUserId(userId: number): StepikTokenData | undefined {
    return queryOne<StepikTokenData>('SELECT * FROM stepik_tokens WHERE user_id = ?', [userId]);
  }

  deleteByUserId(userId: number): void {
    const db = getDatabase();
    db.run('DELETE FROM stepik_tokens WHERE user_id = ?', [userId]);
    saveDatabase();
  }
}
