import { setLastSyncDate } from '@/src/functions/syncHelpers';
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
      // Nettoyage des doublons avant de créer l'index UNIQUE
      //this.runPreIndexCleanupForAdminFiche(db);
      //this.createUniqueAdministrativeFicheIndex(db);

      db.execSync('COMMIT');
    } catch (error) {
      console.error("Erreur lors de la migration : ", error);
      db.execSync('ROLLBACK');
    }
  }

 /* private static runPreIndexCleanupForAdminFiche(db: any): void {
    // Marquer comme supprimées toutes les fiches administratives en doublon par patient,
    // en conservant la plus récente (basée sur createdAt). Cela permet à l'index UNIQUE de se créer.
    db.execSync(`
      UPDATE consultations
      SET deletedAt = strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id IN (
        SELECT c.id FROM consultations c
        JOIN (
          SELECT id_patient, MAX(createdAt) AS maxCreatedAt
          FROM consultations
          WHERE deletedAt IS NULL AND ficheName LIKE '%administrative%'
          GROUP BY id_patient
        ) keep ON keep.id_patient = c.id_patient
        WHERE c.deletedAt IS NULL
          AND c.ficheName LIKE '%administrative%'
          AND c.createdAt < keep.maxCreatedAt
      )
    `);

    // Si égalité stricte sur createdAt, garder l'id le plus grand et supprimer les autres
    db.execSync(`
      UPDATE consultations
      SET deletedAt = strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id IN (
        SELECT c.id FROM consultations c
        JOIN (
          SELECT id_patient, createdAt, MAX(id) AS keepId
          FROM consultations
          WHERE deletedAt IS NULL AND ficheName LIKE '%administrative%'
          GROUP BY id_patient, createdAt
        ) k ON k.id_patient = c.id_patient AND k.createdAt = c.createdAt
        WHERE c.deletedAt IS NULL
          AND c.ficheName LIKE '%administrative%'
          AND c.id <> k.keepId
      )
    `);
  }
*/

  private static createConfigTable(db: any): void {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        value TEXT NOT NULL
      )
    `);
  }


  /* private static createUniqueAdministrativeFicheIndex(db: any): void {
    // Empêche plus d'une fiche administrative ACTIVE (non supprimée) par patient
    // Basé sur la détection actuelle: ficheName contient "administrative"
    db.execSync(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_admin_fiche_per_patient
      ON consultations(id_patient)
      WHERE deletedAt IS NULL AND ficheName LIKE '%administrative%'
    `);
  } */

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
        path TEXT NULL,
        is_administrative BOOLEAN DEFAULT false,  
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL      
      )
    `);
  }


  private static createPatientTable(db: any): void {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_patient VARCHAR(30) UNIQUE,
        date_of_birth DATE,
        photo TEXT,
        last_name VARCHAR(40),
        first_name VARCHAR(60),
        genre VARCHAR(10),
        profession VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        comment VARCHAR(255),
        trafic_user VARCHAR(80),
        status VARCHAR(16),
        type_diabete VARCHAR(10),
        longitude REAL,
        latitude REAL,
        synced BOOLEAN NOT NULL DEFAULT false,
        createdBy VARCHAR(80),
        date DATE NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        deletedAt DATETIME NULL,
        isLocalCreated BOOLEAN NOT NULL DEFAULT true,
        isModified BOOLEAN NOT NULL DEFAULT false,
        fiche_administrative_name VARCHAR(80) NULL
      )
    `);

    db.execSync(`
      CREATE TABLE IF NOT EXISTS consultations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid VARCHAR(80) NOT NULL,
        fileName VARCHAR(80) NOT NULL,
        data TEXT NOT NULL,
        id_patient VARCHAR(30) NULL,
        id_fiche VARCHAR(30) NOT NULL,
        ficheName VARCHAR(80) NOT NULL,
        type_diabete VARCHAR(10) NOT NULL,
        longitude REAL NULL,
        latitude REAL NULL,
        synced BOOLEAN NOT NULL DEFAULT false,
        createdBy VARCHAR(80),
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        date DATE NULL,
        deletedAt DATETIME NULL,
        isLocalCreated BOOLEAN NOT NULL DEFAULT true

      )
    `);

    db.execSync(`
      CREATE TABLE IF NOT EXISTS form_fill (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid VARCHAR(80) NOT NULL,
        id_trafic VARCHAR(15) NULL,
        fileName VARCHAR(80) NOT NULL,
        data TEXT NOT NULL,
        ficheName VARCHAR(80) NOT NULL,
        type_diabete VARCHAR(10) NOT NULL,
        longitude REAL NULL,
        latitude REAL NULL,
        synced BOOLEAN NOT NULL DEFAULT false,
        createdBy VARCHAR(80),
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        deletedAt DATETIME NULL

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

    for (const table of tables as any[]) {
      const name = (table as any).name;
      db.runSync(`DROP TABLE IF EXISTS ${name}`);
      console.log(`Table ${name} supprimée.`);
    }

    setLastSyncDate("");
    console.log("✅ Toutes les tables supprimées.");

    // Ensuite, relancer la création des tables
    this.initialize();
  }


}
