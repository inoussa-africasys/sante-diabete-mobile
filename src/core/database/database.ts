import { DATABASE_NAME } from '@/src/Constants/Database';
import * as SQLite from 'expo-sqlite';
import { initDB as initDBMigrations } from './migrations';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const initDB = async (): Promise<void> => {
    try {
        initDBMigrations();
      console.log('[DB] Initialisation réussie');
    } catch (error) {
      console.error('[DB] Erreur d\'initialisation :', error);
    }
  };
  

/**
 * Retourne l'instance SQLite unique.
 */
export const getDb = async () => {
    if (!dbInstance) {
        dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
    }
    return dbInstance;
};
