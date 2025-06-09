// PatientRepository.ts
import { getDb } from '../core/database/database';
import Patient from '../models/Patient';
import GenericRepository from './GenericRepository';


class PatientRepository {
  private repo: GenericRepository<Patient>;

  constructor() {
    this.repo = new GenericRepository<Patient>(
      getDb,
      'patients',
      Patient.columns(),
      Patient.fromRow
    );
  }

  async getAll(): Promise<Patient[]> {
    return this.repo.getAll();
  }

  async update(patient: Patient) {
    return this.repo.update(patient);
  }

  async findUnsynced(): Promise<Patient[]> {
    const db = await getDb();
    const result = await db.getAllAsync(
      `SELECT * FROM patients WHERE synced = 0;`
    );
    return result.map(Patient.fromRow);
  }

  async findByStatus(status: string): Promise<Patient[]> {
    const db = await getDb();
    const result = await db.getAllAsync(
      `SELECT * FROM patients WHERE status = ?;`,
      [status]
    );
    return result.map(Patient.fromRow);
  }
}

export default new PatientRepository(); // Singleton instance
