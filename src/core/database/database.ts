import { PATH_OF_TRAFIC_DIR_ON_THE_LOCAL } from '@/src/Constants';
import { DATABASE_NAME } from '@/src/Constants/Database';
import * as SQLite from 'expo-sqlite';
import { Migration } from './migrations';

export class DatabaseConnection {
  private static instance: SQLite.SQLiteDatabase;

  static getInstance(): SQLite.SQLiteDatabase {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = SQLite.openDatabaseSync(`${PATH_OF_TRAFIC_DIR_ON_THE_LOCAL}${DATABASE_NAME}`);
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
