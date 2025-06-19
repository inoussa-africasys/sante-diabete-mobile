import Patient from '../models/Patient';
import { GenericRepository } from './GenericRepository';

export class PatientRepository extends GenericRepository<Patient> {
  constructor() {
    super('patients', (data) => new Patient(data));
  }

  async findAllByTypeDiabete(type_diabete: string): Promise<Patient[]> {
    const result = this.db.getAllSync(`SELECT * FROM ${this.tableName} WHERE type_diabete = ?`, [type_diabete]);
    return result.map((item) => this.modelFactory(item));
  }

}
