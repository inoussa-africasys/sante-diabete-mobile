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

  async findAllByPatientId(id_patient: string): Promise<Patient> {
    const result = this.db.getFirstSync(`SELECT * FROM ${this.tableName} WHERE id_patient = ?`, [id_patient]);
    return this.modelFactory(result);
  }

  async findByPatientId(id_patient: string): Promise<Patient> {
    const result = this.db.getFirstSync(`SELECT * FROM ${this.tableName} WHERE id_patient = ?`, [id_patient]);
    return this.modelFactory(result);
  }


  public getPatientByConsultationIdOnLocalDB(consultationId: number): Patient {
    const result = this.db.getFirstSync(
      `SELECT p.* FROM ${this.tableName} p
      INNER JOIN consultations c ON c.id_patient = p.id
      WHERE c.id = ?`,
     [consultationId]
    );
    return this.modelFactory(result);
  }




}
