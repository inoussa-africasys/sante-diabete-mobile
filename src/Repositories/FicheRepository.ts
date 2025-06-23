import Fiche from '../models/Fiche';
import { GenericRepository } from './GenericRepository';

export class FicheRepository extends GenericRepository<Fiche> {
  constructor() {
    super('fiches', (data) => new Fiche(data));
  }

  public findByName(name: string): Fiche | null {
    if (!name) {
      return null;
    }
    const result = this.db.getFirstSync(`SELECT * FROM ${this.tableName} WHERE name = ?`, [name]);
    return result ? this.modelFactory(result) : null;
  }

  public findAllDownloadedAndNotEmptyFiche(type_diabete: string): Fiche[] {
    const result = this.db.getAllSync(`SELECT * FROM ${this.tableName} WHERE type_diabete = ? AND is_downloaded = true AND data IS NOT NULL`, [type_diabete]);
    return result.map((item) => this.modelFactory(item));
  }

  public insertIfNotExistsByName(type_diabete: string,names: string[]): void {
    const db = this.db;

    // Créer une clause IN avec les placeholders pour éviter l'injection SQL
    const placeholders = names.map(() => '?').join(',');
    const existingRows = db.getAllSync(
      `SELECT name FROM fiches WHERE name IN (${placeholders} AND type_diabete = ?)`,
      [...names, type_diabete]
    );

    const existingNames = new Set(existingRows.map((row: any) => row.name));
    const newNames = names.filter(name => !existingNames.has(name));

    if (newNames.length === 0) return;

    const now = new Date().toISOString();
    const values: any[] = [];

    for (const name of newNames) {
      values.push(name, type_diabete,'', false, now, now); // name, type_diabete, path, is_downloaded, createdAt, updatedAt
    }

    const rowsSql = newNames.map(() => '(?, ?, ?, ?, ?, ?)').join(',');
    const sql = `INSERT INTO fiches (name, type_diabete, path, is_downloaded, createdAt, updatedAt) VALUES ${rowsSql}`;
    db.runSync(sql, values);
  }


}
