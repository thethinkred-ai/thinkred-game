import { getDatabase } from '../database';
import { queryAll } from '../database/query';

export interface EconomicSnapshotRow {
  id: number;
  user_id: number;
  indicators: string;
  created_at: string;
}

export class SnapshotModel {
  save(userId: number, indicatorsJson: string) {
    const db = getDatabase();
    db.run(
      'INSERT INTO economic_snapshots (user_id, indicators) VALUES (?, ?)',
      [userId, indicatorsJson]
    );
  }

  findHistoryByUser(userId: number, limit = 50): EconomicSnapshotRow[] {
    return queryAll<EconomicSnapshotRow>(
      'SELECT * FROM economic_snapshots WHERE user_id = ? ORDER BY created_at ASC LIMIT ?',
      [userId, limit]
    );
  }
}
