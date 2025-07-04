import { FormFill } from '../models/FormFill';
import { GenericRepository } from './GenericRepository';

export class FormFillRepository extends GenericRepository<FormFill> {
  constructor() {
    super('form_fill', (data) => new FormFill(data));
  }

  public findAllByFicheName(name: string): FormFill[] {
    const result = this.db.getAllSync(`SELECT * FROM ${this.tableName} WHERE ficheName = ?`, [name]);
    return result.map((item) => this.modelFactory(item));
  }

  public getListFicheNameUniquesOfFormFill(): string[] {
    const result = this.db.getAllSync(`SELECT DISTINCT ficheName FROM ${this.tableName}`);
    return result.map((item) => (item as any).ficheName);
  }

  public countUnsyncedFormFill(ficheName: string): number {
    const result = this.db.getFirstSync(`SELECT COUNT(*) FROM ${this.tableName} WHERE synced = false AND ficheName = ?`, [ficheName]);
    return (result as any).count;
  }

  public getUnSyncedFormFill(): FormFill[] {
    const result = this.db.getAllSync(`SELECT * FROM ${this.tableName} WHERE synced = false`);
    return result.map((item) => this.modelFactory(item));
  }

  public getFichesFilledWithFormFill(): Map<string, FormFill> {
    const result = this.db.getAllSync(`SELECT * FROM ${this.tableName}`);
    const fichesFilled = new Map<string, FormFill>();
    result.forEach((item) => {
      fichesFilled.set((item as any).ficheName, this.modelFactory(item));
    });
    return fichesFilled;
  }

 

}
