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
}
