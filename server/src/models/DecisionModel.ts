import { randomUUID } from 'crypto';
import { getDatabase } from '../database';

export interface DecisionData {
  id: string;
  user_id: number;
  enterprise_id: string | null;
  type: string;
  value: number;
  result: string;
  created_at: string;
}

export class DecisionModel {
  /**
   * Persist a decision and return its generated id.
   * Uses crypto.randomUUID() so ids are collision-free (replaces the previous
   * Math.random().toString(36).substr(2, 9) scheme).
   */
  create(data: {
    user_id: number;
    enterprise_id: string | null;
    type: string;
    value: number;
    result: unknown;
  }): string {
    const id = randomUUID();
    const db = getDatabase();
    db.run(
      'INSERT INTO decisions (id, user_id, enterprise_id, type, value, result) VALUES (?, ?, ?, ?, ?, ?)',
      [id, data.user_id, data.enterprise_id, data.type, data.value, JSON.stringify(data.result)]
    );
    return id;
  }
}
