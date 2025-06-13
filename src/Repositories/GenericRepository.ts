import { BATCH_SIZE } from '../Constants/App';
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
    const db = this.db;
    console.log('Inserting item:', item);
    const fields = Object.keys(item).filter(k => item[k as keyof T] !== undefined);
    console.log('Fields:', fields);
    const placeholders = fields.map(() => '?').join(',');
    const values = fields.map(k => item[k as keyof T]);
    console.log('Values:', values);
    const query = `INSERT INTO ${this.tableName} (${fields.join(',')}) VALUES (${placeholders})`;
    console.log('Query:', query);
    this.db.runSync(query, values);
    console.log('Inserted item:', item);
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

  insertAllOptimizedBatch(items: T[]): void {
    if (items.length === 0) return;
  
    const db = this.db;
    
  
    db.execSync('BEGIN TRANSACTION');
  
    try {
      const firstItem = items[0];
      const fields = Object.keys(firstItem).filter(k => firstItem[k as keyof T] !== undefined);
      const baseQuery = `INSERT INTO ${this.tableName} (${fields.join(',')}) VALUES `;
  
      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batchItems = items.slice(i, i + BATCH_SIZE);
  
        const placeholdersPerRow = '(' + fields.map(() => '?').join(',') + ')';
        const placeholders = Array(batchItems.length).fill(placeholdersPerRow).join(',');
  
        const query = baseQuery + placeholders;
  
        const allValues: any[] = [];
        for (const item of batchItems) {
          const values = fields.map(k => item[k as keyof T]);
          allValues.push(...values);
        }

        console.log(query);
        console.log(allValues);
  
        db.runSync(query, allValues);
      }
  
      db.execSync('COMMIT');
    } catch (err) {
      console.error("InsertAll Optimized Batch Error:", err);
      db.execSync('ROLLBACK');
    }
  }
  

  insertAll(items: T[]): void {
    if (items.length === 0) return;
    const db = this.db;
    db.execSync('BEGIN TRANSACTION');
    try {
      for (const item of items) {
        this.insert(item);
      }
      db.execSync('COMMIT');
    } catch (err) {
      console.error("InsertAll Error:", err);
      db.execSync('ROLLBACK');
    }
  }

  clean(): void {
    const db = this.db;
  
    db.execSync('BEGIN TRANSACTION');
    try {
      // Supprimer tous les enregistrements
      const deleteQuery = `DELETE FROM ${this.tableName}`;
      db.runSync(deleteQuery);
  
      // Réinitialiser l'AUTOINCREMENT
      const resetSeqQuery = `DELETE FROM sqlite_sequence WHERE name = ?`;
      db.runSync(resetSeqQuery, [this.tableName]);
  
      db.execSync('COMMIT');
    } catch (error) {
      console.error('Clean Error:', error);
      db.execSync('ROLLBACK');
    }
  }
  
}
