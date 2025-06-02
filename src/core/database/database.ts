// src/db/database.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseAsync('database.db');

/**
 * Retourne l'instance SQLite unique.
 */
export const getDb = () => db;
