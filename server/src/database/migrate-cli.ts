import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { migrateGameEventsColumns, migrateEnterprisePeriod, migrateAchievements } from './migrations';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'thinkred.db');

async function main() {
  console.log(`Running migrations on ${DB_PATH}...`);

  const SQL = await initSqlJs();
  let db;

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    console.log('Database loaded');
  } else {
    db = new SQL.Database();
    console.log('Creating new database');
  }

  migrateGameEventsColumns(db);
  migrateEnterprisePeriod(db);
  migrateAchievements(db);

  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  db.close();

  console.log('Migrations complete');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
