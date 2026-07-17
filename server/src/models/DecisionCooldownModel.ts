import { getDatabase } from '../database';
import { queryOne } from '../database/query';

export class DecisionCooldownModel {
  private static readonly COOLDOWN_MS = 86400000;

  canAct(userId: number): { allowed: boolean; remainingMs: number } {
    const row = queryOne<{ last_decision_at: string }>(
      'SELECT last_decision_at FROM decision_cooldowns WHERE user_id = ?',
      [userId]
    );

    if (!row) {
      this.updateTimestamp(userId);
      return { allowed: true, remainingMs: 0 };
    }

    const lastAt = new Date(row.last_decision_at).getTime();
    const now = Date.now();
    const elapsed = now - lastAt;

    if (elapsed >= DecisionCooldownModel.COOLDOWN_MS) {
      this.updateTimestamp(userId);
      return { allowed: true, remainingMs: 0 };
    }

    return { allowed: false, remainingMs: DecisionCooldownModel.COOLDOWN_MS - elapsed };
  }

  updateTimestamp(userId: number): void {
    const db = getDatabase();
    db.run(`
      INSERT INTO decision_cooldowns (user_id, last_decision_at)
      VALUES (?, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET last_decision_at = datetime('now')
    `, [userId]);
  }

  getRemainingMs(userId: number): number {
    const row = queryOne<{ last_decision_at: string }>(
      'SELECT last_decision_at FROM decision_cooldowns WHERE user_id = ?',
      [userId]
    );

    if (!row) return 0;

    const elapsed = Date.now() - new Date(row.last_decision_at).getTime();
    return Math.max(0, DecisionCooldownModel.COOLDOWN_MS - elapsed);
  }
}