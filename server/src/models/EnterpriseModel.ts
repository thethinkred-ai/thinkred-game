import { getDatabase } from '../database';

export interface EnterpriseData {
  id: string;
  owner_id: number;
  name: string;
  type: string;
  level: number;
  workers: number;
  wage_rate: number;
  production: number;
  costs_labor: number;
  costs_materials: number;
  costs_overhead: number;
  costs_depreciation: number;
  revenue: number;
  profit: number;
  surplus_value: number;
  technology: number;
  location: string;
  established: number;
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

export class EnterpriseModel {
  findById(id: string): EnterpriseData | undefined {
    return queryOne<EnterpriseData>('SELECT * FROM enterprises WHERE id = ?', [id]);
  }

  findByOwner(ownerId: number): EnterpriseData[] {
    return queryAll<EnterpriseData>('SELECT * FROM enterprises WHERE owner_id = ? ORDER BY created_at DESC', [ownerId]);
  }

  create(data: {
    id: string;
    owner_id: number;
    name: string;
    type: string;
    location: string;
    production: number;
    costs_materials: number;
    costs_overhead: number;
    costs_depreciation: number;
  }): EnterpriseData {
    const db = getDatabase();
    db.run(`
      INSERT INTO enterprises (id, owner_id, name, type, location, production, costs_materials, costs_overhead, costs_depreciation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.id, data.owner_id, data.name, data.type, data.location,
      data.production, data.costs_materials, data.costs_overhead, data.costs_depreciation
    ]);
    return this.findById(data.id)!;
  }

  update(id: string, updates: Partial<Omit<EnterpriseData, 'id' | 'owner_id'>>): EnterpriseData | undefined {
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const db = getDatabase();
    db.run(`UPDATE enterprises SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  delete(id: string): boolean {
    const db = getDatabase();
    db.run('DELETE FROM enterprises WHERE id = ?', [id]);
    return true;
  }

  countByOwner(ownerId: number): number {
    const row = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM enterprises WHERE owner_id = ?', [ownerId]);
    return row?.count ?? 0;
  }
}
