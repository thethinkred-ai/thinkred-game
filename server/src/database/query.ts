import { getDatabase } from './index';

export function queryOne<T>(sql: string, params: unknown[] = []): T | undefined {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const cols = stmt.getColumnNames();
    const values = stmt.get();
    const row: Record<string, unknown> = {};
    cols.forEach((col: string, i: number) => { row[col] = values[i]; });
    stmt.free();
    return row as T;
  }
  stmt.free();
  return undefined;
}

export function queryAll<T>(sql: string, params: unknown[] = []): T[] {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    const cols = stmt.getColumnNames();
    const values = stmt.get();
    const row: Record<string, unknown> = {};
    cols.forEach((col: string, i: number) => { row[col] = values[i]; });
    results.push(row as T);
  }
  stmt.free();
  return results;
}
