import { SQLiteBindValue } from 'expo-sqlite';
import { BATCH_SIZE } from '../Constants/App';
import { DatabaseConnection } from '../core/database/database';
import { QueryBuilder } from '../core/database/QueryBuilder';
import { BaseModel } from '../models/BaseModel';
import Logger from '../utils/Logger';

export class GenericRepository<T extends BaseModel> {
  protected db = DatabaseConnection.getInstance();
  protected tableName: string;
  protected modelFactory: (data: any) => T;
  protected ignoreSoftDelete: boolean;

  constructor(tableName: string, modelFactory: (data: any) => T, ignoreSoftDelete = true) {
    this.tableName = tableName;
    this.modelFactory = modelFactory;
    this.ignoreSoftDelete = ignoreSoftDelete;
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

  /*  findAll(): T[] {
     const results = this.db.getAllSync(`SELECT * FROM ${this.tableName}`);
     return results.map(this.modelFactory);
   }
  */

  findAll(): T[] {
    const query = this.ignoreSoftDelete
      ? `SELECT * FROM ${this.tableName}`
      : `SELECT * FROM ${this.tableName} WHERE deletedAt IS NULL`;

    const rows = this.db.getAllSync(query);
    return rows.map(this.modelFactory);
  }

  getAll(): T[] {
    return this.findAll();
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

        db.runSync(query, allValues);
      }

      db.execSync('COMMIT');
    } catch (err) {
      console.error("InsertAll Optimized Batch Error:", err);
      Logger.log('error', 'InsertAll Optimized Batch Error', { error: err });
      db.execSync('ROLLBACK');
    }
  }


  insertAll(items: T[]): void {
    if (items.length === 0) return;
    const db = this.db;
    db.execSync('BEGIN TRANSACTION');
    try {
      for (const item of items) {
        if (!item.createdAt) item.createdAt = new Date().toISOString();
        if (!item.updatedAt) item.updatedAt = new Date().toISOString();
        this.insert(item);
      }
      db.execSync('COMMIT');
    } catch (err) {
      console.error("InsertAll Error:", err);
      Logger.log('error', 'InsertAll Error', { error: err });
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
      Logger.log('error', 'Clean Error', { error });
      db.execSync('ROLLBACK');
    }
  }


  updatev2(id: number, item: Partial<T>): void {
    // Enlever les champs undefined et ne pas inclure 'id'
    const entries = Object.entries(item).filter(([key, value]) => key !== 'id' && value !== undefined);

    const fields = entries.map(([key]) => `${key} = ?`);
    const values = entries.map(([_, value]) => value);

    const query = `UPDATE ${this.tableName} SET ${fields.join(', ')} WHERE id = ?`;

    this.db.runSync(query, [...values, id]);
  }


  insertAndReturn(item: T): T | null {
    const fields = Object.keys(item).filter(k => k !== 'id' && item[k as keyof T] !== undefined);
    const placeholders = fields.map(() => '?').join(',');
    const values = fields.map(k => item[k as keyof T]);

    const insertQuery = `INSERT INTO ${this.tableName} (${fields.join(',')}) VALUES (${placeholders})`;
    this.db.runSync(insertQuery, values);

    // SQLite retourne l'ID de la dernière insertion auto-incrémentée via cette fonction spéciale
    const result = this.db.getFirstSync(`SELECT last_insert_rowid() as id`);
    const insertedId = result?.id!;

    if (!insertedId) return null;

    const row = this.db.getFirstSync(`SELECT * FROM ${this.tableName} WHERE id = ?`, [insertedId]);
    return row ? this.modelFactory(row) : null;
  }


  async softDelete(id: string): Promise<void> {
    const query = `UPDATE ${this.tableName} SET deletedAt = ? WHERE id = ?`;
    const deletedAt = new Date().toISOString();

    try {
      await this.db.runAsync(query, [deletedAt, id]);
      console.log(`🗑️ Soft delete OK sur ${this.tableName} pour ID=${id}`);
    } catch (err) {
      console.error(`❌ Soft delete échoué sur ${this.tableName}`, err);
      Logger.log('error', 'Soft delete error', { error: err });
    }
  }

  async restore(id: string): Promise<void> {
    const query = `UPDATE ${this.tableName} SET deletedAt = NULL WHERE id = ?`;
    await this.db.runAsync(query, [id]);
    console.log(`🗑️ Soft delete OK sur ${this.tableName} pour ID=${id}`);
    Logger.log('info', 'Restore OK sur', { tableName: this.tableName, id });
  }

  async forceDelete(id: number): Promise<void> {
    await this.db.runAsync(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    console.log(`Force delete OK sur ${this.tableName} pour ID=${id}`);
    Logger.log('info', 'Force delete OK sur', { tableName: this.tableName, id });
  }


  async createOrUpdate(item: T, uniqueKey: keyof T): Promise<void> {
    try {
      const keyValue = item[uniqueKey] as unknown as SQLiteBindValue;

      const existing = await this.db.getFirstSync(
        `SELECT * FROM ${this.tableName} WHERE ${String(uniqueKey)} = ?`,
        [keyValue]
      );

      if (existing) {
        const fields = Object.keys(item).filter(k => k !== 'id');
        const setters = fields.map(k => `${k} = ?`).join(', ');
        const values = fields.map(k => item[k as keyof T] as SQLiteBindValue);
        values.push(keyValue);

        const sql = `UPDATE ${this.tableName} SET ${setters} WHERE ${String(uniqueKey)} = ?`;
        await this.db.runAsync(sql, values);
      } else {
        await this.insert(item);
      }
    } catch (error) {
      console.error('Error creating or updating item:', error);
      Logger.log('error', 'Error creating or updating item', { error });
    }
  }


  async createOrUpdateAndReturnId(item: T, uniqueKey: keyof T): Promise<string | number | undefined> {
    try {
      const keyValue = item[uniqueKey] as unknown as SQLiteBindValue;
  
      const existing = await this.db.getFirstSync(
        `SELECT * FROM ${this.tableName} WHERE ${String(uniqueKey)} = ?`,
        [keyValue]
      );
  
      if (existing) {
        const fields = Object.keys(item).filter(k => k !== 'id');
        const setters = fields.map(k => `${k} = ?`).join(', ');
        const values = fields.map(k => item[k as keyof T] as SQLiteBindValue);
        values.push(keyValue);
  
        const sql = `UPDATE ${this.tableName} SET ${setters} WHERE ${String(uniqueKey)} = ?`;
        await this.db.runAsync(sql, values);
  
        // Retourne l'id existant
        return existing.id;
      } else {
        // Insertion
        const insertedId = await this.insert(item);
        return insertedId; // `insert` doit retourner l'ID inséré
      }
    } catch (error) {
      console.error('Error creating or updating item:', error);
      Logger.log('error', 'Error creating or updating item', { error });
      return undefined;
    }
  }
  




}
