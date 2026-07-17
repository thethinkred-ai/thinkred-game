import { getDatabase } from '../database';
import { queryOne, queryAll } from '../database/query';
import { ACHIEVEMENTS } from '../../../shared/constants/game';

export interface UserAchievementData {
  id: number;
  user_id: number;
  achievement_key: string;
  unlocked_at: string;
}

export class AchievementModel {
  findByUser(userId: number): string[] {
    return queryAll<{ achievement_key: string }>(
      'SELECT achievement_key FROM user_achievements WHERE user_id = ? ORDER BY unlocked_at',
      [userId]
    ).map((row) => row.achievement_key);
  }

  unlock(userId: number, achievementKey: string): boolean {
    const existing = queryOne<{ id: number }>(
      'SELECT id FROM user_achievements WHERE user_id = ? AND achievement_key = ?',
      [userId, achievementKey]
    );
    if (existing) return false;

    const db = getDatabase();
    db.run(
      'INSERT INTO user_achievements (user_id, achievement_key) VALUES (?, ?)',
      [userId, achievementKey]
    );
    return true;
  }

  checkAndUnlock(userId: number, gameState: {
    level: number;
    experience: number;
    enterprises: number;
    periods: number;
    maxProfit: number;
    events: number;
  }): string[] {
    const existing = this.findByUser(userId);
    const newlyUnlocked: string[] = [];

    for (const [key, def] of Object.entries(ACHIEVEMENTS)) {
      if (existing.includes(key)) continue;

      let met = false;
      switch (def.check) {
        case 'level':
          met = gameState.level >= def.target;
          break;
        case 'experience':
          met = gameState.experience >= def.target;
          break;
        case 'enterprises':
          met = gameState.enterprises >= def.target;
          break;
        case 'period':
          met = gameState.periods >= def.target;
          break;
        case 'profit':
          met = gameState.maxProfit >= def.target;
          break;
        case 'events':
          met = gameState.events >= def.target;
          break;
      }

      if (met && this.unlock(userId, key)) {
        newlyUnlocked.push(key);
      }
    }

    return newlyUnlocked;
  }
}
