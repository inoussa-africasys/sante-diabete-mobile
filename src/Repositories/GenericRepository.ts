import { DatabaseConnection } from '../core/database/database';
import { QueryBuilder } from '../core/database/QueryBuilder';
import { BaseModel } from '../models/BaseModel';

export class GenericRepository<T extends BaseModel> {
  protected db = DatabaseConnection.getInstance();
  protected tableName: string;
  protected modelFactory: (data: any) => T;

  constructor(tableName: string, modelFactory: (data: any) => T) {
    this.tableName = tableName;
    this.modelFactory = modelFactory;
  }

  insert(item: T): void {
    const fields = Object.keys(item).filter(k => item[k as keyof T] !== undefined);
    const placeholders = fields.map(() => '?').join(',');
    const values = fields.map(k => item[k as keyof T]);

    const query = `INSERT INTO ${this.tableName} (${fields.join(',')}) VALUES (${placeholders})`;

    this.db.runSync(query, values);
  }

  update(id: number, item: Partial<T>): void {
    const fields = Object.keys(item);
    const assignments = fields.map(k => `${k} = ?`).join(',');
    const values = fields.map(k => item[k as keyof T]);

    const query = `UPDATE ${this.tableName} SET ${assignments} WHERE id = ?`;

    this.db.runSync(query, [...values, id]);
  }

  delete(id: number): void {
    this.db.runSync(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
  }

  findById(id: number): T | null {
    const result = this.db.getFirstSync(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return result ? this.modelFactory(result) : null;
  }

  findAll(): T[] {
    const results = this.db.getAllSync(`SELECT * FROM ${this.tableName}`);
    return results.map(this.modelFactory);
  }


  query(): QueryBuilder<T> {
    return new QueryBuilder(this.tableName, this.db, this.modelFactory);
  }
}
