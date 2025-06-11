import { DatabaseConnection } from './database';

export class Migration {
  static initialize(): void {
    console.log('Migration initialize');
    const db = DatabaseConnection.getInstance();
    console.log('db', db);


    db.execSync('BEGIN TRANSACTION');

    try {
      this.createConfigTable(db);
      this.createQRCodeTable(db);
      this.createPatientTable(db);

      db.execSync('COMMIT');
    } catch (error) {
      console.error("Erreur lors de la migration : ", error);
      db.execSync('ROLLBACK');
    }
  }


  private static createConfigTable(db: any): void {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        value TEXT NOT NULL
      )
    `);
  }

  private static createQRCodeTable(db: any): void {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        url TEXT NOT NULL,
        code TEXT NOT NULL,
        username TEXT NOT NULL
      )
    `);
  }

  private static createPatientTable(db: any): void {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_patient TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        date TEXT NOT NULL,
        photo TEXT NOT NULL,
        user_id TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_synced_at TEXT NOT NULL,
        synced INTEGER NOT NULL
      )
    `);
  }
}
