import { getDatabase } from '../database';
import { queryOne, queryAll } from '../database/query';

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
  created_period: string;
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
    created_period: string;
  }): EnterpriseData {
    const db = getDatabase();
    db.run(`
      INSERT INTO enterprises (id, owner_id, name, type, location, production, costs_materials, costs_overhead, costs_depreciation, created_period)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.id, data.owner_id, data.name, data.type, data.location,
      data.production, data.costs_materials, data.costs_overhead, data.costs_depreciation, data.created_period
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

  countByOwnerAndPeriod(ownerId: number, period: string): number {
    const row = queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM enterprises WHERE owner_id = ? AND created_period = ?',
      [ownerId, period]
    );
    return row?.count ?? 0;
  }

  findMapByPeriod(period: string): Array<EnterpriseData & { owner_name: string }> {
    return queryAll<EnterpriseData & { owner_name: string }>(
      `SELECT e.*, u.first_name || ' ' || u.last_name as owner_name
       FROM enterprises e
       JOIN users u ON e.owner_id = u.id
       WHERE e.created_period = ?
       ORDER BY e.profit DESC`,
      [period]
    );
  }

  findMapAll(): Array<EnterpriseData & { owner_name: string }> {
    return queryAll<EnterpriseData & { owner_name: string }>(
      `SELECT e.*, u.first_name || ' ' || u.last_name as owner_name
       FROM enterprises e
       JOIN users u ON e.owner_id = u.id
       ORDER BY e.created_period, e.profit DESC`
    );
  }
}
