import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'thinkred.db');

let db: SqlJsDatabase | null = null;
let saveInterval: ReturnType<typeof setInterval> | null = null;

export async function initDatabase(): Promise<SqlJsDatabase> {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    logger.info(`Database loaded from ${DB_PATH}`);
  } else {
    db = new SQL.Database();
    logger.info('Creating new database');
  }

  runMigrations(db);

  saveInterval = setInterval(() => saveDatabase(), 30000);

  return db;
}

export function getDatabase(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

function runMigrations(db: SqlJsDatabase) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stepik_id INTEGER UNIQUE,
      email TEXT NOT NULL,
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      level INTEGER NOT NULL DEFAULT 1,
      experience INTEGER NOT NULL DEFAULT 0,
      current_period TEXT NOT NULL DEFAULT 'feudalism',
      unlocked_features TEXT NOT NULL DEFAULT '["basic_enterprises"]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS enterprises (
      id TEXT PRIMARY KEY,
      owner_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      workers INTEGER NOT NULL DEFAULT 0,
      wage_rate REAL NOT NULL DEFAULT 100,
      production REAL NOT NULL DEFAULT 0,
      costs_labor REAL NOT NULL DEFAULT 0,
      costs_materials REAL NOT NULL DEFAULT 0,
      costs_overhead REAL NOT NULL DEFAULT 0,
      costs_depreciation REAL NOT NULL DEFAULT 0,
      revenue REAL NOT NULL DEFAULT 0,
      profit REAL NOT NULL DEFAULT 0,
      surplus_value REAL NOT NULL DEFAULT 0,
      technology REAL NOT NULL DEFAULT 1,
      location TEXT NOT NULL DEFAULT '',
      established INTEGER NOT NULL DEFAULT 2024,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_events (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      event_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      period TEXT NOT NULL,
      year INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      choice_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      enterprise_id TEXT REFERENCES enterprises(id),
      type TEXT NOT NULL,
      value REAL NOT NULL DEFAULT 0,
      result TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function saveDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (error) {
    logger.error('Failed to save database:', error);
  }
}

export function closeDatabase() {
  if (saveInterval) {
    clearInterval(saveInterval);
    saveInterval = null;
  }
  saveDatabase();
  if (db) {
    db.close();
    db = null;
    logger.info('Database connection closed');
  }
}
