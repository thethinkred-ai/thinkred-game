import { getDatabase } from '../database';
import { queryOne, queryAll } from '../database/query';

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
  choices_json: string | null;
  created_at: string;
  resolved_at: string | null;
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
    choices_json?: string;
  }): GameEventData {
    const db = getDatabase();
    db.run(`
      INSERT INTO game_events (id, user_id, event_type, title, description, period, year, choices_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [data.id, data.user_id, data.event_type, data.title, data.description, data.period, data.year, data.choices_json ?? null]);
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

  countResolvedByUser(userId: number): number {
    const row = queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM game_events WHERE user_id = ? AND status = ?',
      [userId, 'resolved']
    );
    return row?.count ?? 0;
  }

  findResolvedByUser(userId: number, limit = 50): GameEventData[] {
    return queryAll<GameEventData>(
      'SELECT * FROM game_events WHERE user_id = ? AND status = ? ORDER BY resolved_at DESC LIMIT ?',
      [userId, 'resolved', limit]
    );
  }
}
