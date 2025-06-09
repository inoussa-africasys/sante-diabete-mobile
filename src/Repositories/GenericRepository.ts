import { SQLiteDatabase } from 'expo-sqlite';
import { BaseModel } from '../models/BaseModel';

export default class GenericRepository<T extends BaseModel> {
  constructor(
    private getDb: () => Promise<SQLiteDatabase>,
    private tableName: string,
    private columns: string[],
    private fromRow: (row: any) => T
  ) {}

  async insert(item: T): Promise<number> {
    const db = await this.getDb();
    const placeholders = this.columns.map(() => '?').join(', ');
    const sql = `INSERT INTO ${this.tableName} (${this.columns.join(', ')}) VALUES (${placeholders});`;
    const result = await db.runAsync(sql, item.toDB());
    return result.lastInsertRowId ?? 0;
  }

  async getAll(): Promise<T[]> {
    const db = await this.getDb();
    const sql = `SELECT * FROM ${this.tableName};`;
    const result = await db.getAllAsync(sql);
    return result.map(this.fromRow);
  }

  async deleteById(id: number): Promise<void> {
    const db = await this.getDb();
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?;`;
    await db.runAsync(sql, [id]);
  }

  async findById(id: number): Promise<T | null> {
    const db = await this.getDb();
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1;`;
    const result = await db.getFirstAsync(sql, [id]);
    return result ? this.fromRow(result) : null;
  }

  async update(item: T, updateTimestamp = true): Promise<void> {
    if (!item.id) {
      throw new Error('Cannot update item without id');
    }
  
    const db = await this.getDb();
  
    const updateCols = [...this.columns];
    const values = [...item.toDB()];
  
    if (updateTimestamp && this.columns.includes('updated_at')) {
      updateCols.push('updated_at');
      values.push(new Date().toISOString());
    }
  
    const setClause = updateCols.map(col => `${col} = ?`).join(', ');
    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?;`;
  
    await db.runAsync(sql, [...values, item.id]);
  }
  
}
