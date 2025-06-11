import Patient from '../models/Patient';
import { GenericRepository } from './GenericRepository';

export class PatientRepository extends GenericRepository<Patient> {
  constructor() {
    super('patients', (data) => new Patient(data));
  }
}
