import { PATH_OF_TRAFIC_DIR_ON_THE_LOCAL } from '@/src/Constants';
import { DATABASE_NAME } from '@/src/Constants/Database';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { Migration } from './migrations';

export class DatabaseConnection {
  private static instance: SQLite.SQLiteDatabase;

  static getInstance(): SQLite.SQLiteDatabase {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = SQLite.openDatabaseSync(`${DATABASE_NAME}`, {}, `${FileSystem.documentDirectory}${PATH_OF_TRAFIC_DIR_ON_THE_LOCAL}`);
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
