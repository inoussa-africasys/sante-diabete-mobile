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
      this.createFicheTable(db);

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

  private static createFicheTable(db: any): void {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS fiches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type_diabete TEXT NOT NULL,
        data TEXT NULL,
        is_downloaded BOOLEAN DEFAULT false,
        path TEXT       
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



  static resetDatabase() {
    const db = DatabaseConnection.getInstance();

    // Récupère toutes les tables sauf les internes (sqlite_sequence, etc.)
    const tables = db.getAllSync(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);

    for (const table of tables) {
      db.runSync(`DROP TABLE IF EXISTS ${table.name}`);
      console.log(`Table ${table.name} supprimée.`);
    }

    console.log("✅ Toutes les tables supprimées.");

    // Ensuite, relancer la création des tables
    this.initialize();
  }


}
