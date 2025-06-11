import { DATABASE_NAME } from '@/src/Constants/Database';
import * as SQLite from 'expo-sqlite';
import { Migration } from './migrations';

export class DatabaseConnection {
  private static instance: SQLite.SQLiteDatabase;

  static getInstance(): SQLite.SQLiteDatabase {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = SQLite.openDatabaseSync(DATABASE_NAME);
    }
    
    return DatabaseConnection.instance;
  }

  static getDb(): SQLite.SQLiteDatabase {
    return DatabaseConnection.getInstance();
  }

  static initDB(): void {
    Migration.initialize();
  }
}
