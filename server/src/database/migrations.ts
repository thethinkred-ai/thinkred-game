import { Database as SqlJsDatabase } from 'sql.js';

export function migrateGameEventsColumns(db: SqlJsDatabase) {
  const cols = db.exec('PRAGMA table_info(game_events)');
  const colNames = cols[0]?.values.map((row: any[]) => row[1] as string) ?? [];
  if (!colNames.includes('choices_json')) {
    db.run('ALTER TABLE game_events ADD COLUMN choices_json TEXT');
  }
}

export function migrateEnterprisePeriod(db: SqlJsDatabase) {
  const cols = db.exec('PRAGMA table_info(enterprises)');
  const colNames = cols[0]?.values.map((row: any[]) => row[1] as string) ?? [];
  if (!colNames.includes('created_period')) {
    db.run("ALTER TABLE enterprises ADD COLUMN created_period TEXT NOT NULL DEFAULT 'feudalism'");
  }
}

export function migrateUserSecurityColumns(db: SqlJsDatabase) {
  const cols = db.exec('PRAGMA table_info(users)');
  const colNames = cols[0]?.values.map((row: any[]) => row[1] as string) ?? [];
  if (!colNames.includes('is_active')) {
    db.run('ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1');
  }
  if (!colNames.includes('role')) {
    db.run("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
  }
}

export function migrateAchievements(db: SqlJsDatabase) {
  db.run(`
    CREATE TABLE IF NOT EXISTS user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      achievement_key TEXT NOT NULL,
      unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, achievement_key)
    )
  `);
}
