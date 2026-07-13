import { getDatabase } from '../database';

export interface GameEventData {
  id: string;
  user_id: number;
  event_type: string;
  title: string;
  description: string;
  period: string;
  year: number;
  status: string;
  choice_id: string | null;
  created_at: string;
  resolved_at: string | null;
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

export class EventModel {
  findById(id: string): GameEventData | undefined {
    return queryOne<GameEventData>('SELECT * FROM game_events WHERE id = ?', [id]);
  }

  findActiveByUser(userId: number): GameEventData[] {
    return queryAll<GameEventData>(
      'SELECT * FROM game_events WHERE user_id = ? AND status = ? ORDER BY created_at DESC',
      [userId, 'active']
    );
  }

  create(data: {
    id: string;
    user_id: number;
    event_type: string;
    title: string;
    description: string;
    period: string;
    year: number;
  }): GameEventData {
    const db = getDatabase();
    db.run(`
      INSERT INTO game_events (id, user_id, event_type, title, description, period, year)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [data.id, data.user_id, data.event_type, data.title, data.description, data.period, data.year]);
    return this.findById(data.id)!;
  }

  resolve(id: string, choiceId: string): GameEventData | undefined {
    const db = getDatabase();
    db.run(
      'UPDATE game_events SET status = ?, choice_id = ?, resolved_at = datetime(\'now\') WHERE id = ?',
      ['resolved', choiceId, id]
    );
    return this.findById(id);
  }

  countActiveByUser(userId: number): number {
    const row = queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM game_events WHERE user_id = ? AND status = ?',
      [userId, 'active']
    );
    return row?.count ?? 0;
  }
}
