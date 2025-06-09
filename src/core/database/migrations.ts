import { getDb } from './database';

export const initDB = async (): Promise<void> => {
  const db = await getDb();

  if (!db) {
    throw new Error('Database instance is null');
  }

  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS config (
        id TEXT PRIMARY KEY NOT NULL,
        name VARCHAR(100),
        value TEXT
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id TEXT PRIMARY KEY NOT NULL,
        url TEXT,
        code TEXT,
        username TEXT
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS organisations (
        id TEXT PRIMARY KEY NOT NULL,
        name VARCHAR(100)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        name VARCHAR(100),
        email VARCHAR(100),
        organisation_id TEXT,
        created_at DATETIME,
        updated_at DATETIME,
        synced INTEGER DEFAULT 0,
        CONSTRAINT fk_organisation_users FOREIGN KEY (organisation_id) REFERENCES organisations(id)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY NOT NULL,
        id_patient VARCHAR(100),
        first_name VARCHAR(50),
        last_name VARCHAR(60),
        date DATE,
        photo TEXT,
        user_id TEXT,
        status VARCHAR(20),
        created_at DATETIME,
        updated_at DATETIME,
        last_synced_at DATETIME,
        synced INTEGER DEFAULT 0,
        CONSTRAINT fk_users_patients FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
  });
};
