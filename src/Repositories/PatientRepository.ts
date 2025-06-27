import { getDiabetesType } from '../functions';
import Patient from '../models/Patient';
import Logger from '../utils/Logger';
import { GenericRepository } from './GenericRepository';

export class PatientRepository extends GenericRepository<Patient> {
  constructor() {
    super('patients', (data) => new Patient(data), false);
  }

  async findAllByTypeDiabete(type_diabete: string): Promise<Patient[]> {
    try {
      const result = this.db.getAllSync(`SELECT * FROM ${this.tableName} WHERE type_diabete = ?`, [type_diabete]);
      return result.map((item) => this.modelFactory(item));
    } catch (error) {
      console.error('Error fetching patients by type diabete:', error);
      Logger.log('error', 'Error fetching patients by type diabete', { error });
      return [];
    }
  }

  async findAllByPatientId(id_patient: string): Promise<Patient | null> {
    try {
      const result = this.db.getFirstSync(`SELECT * FROM ${this.tableName} WHERE id_patient = ?`, [id_patient]);
      return this.modelFactory(result);
    } catch (error) {
      console.error('Error fetching patient by id patient:', error);
      Logger.log('error', 'Error fetching patient by id patient', { error });
      return null;
    }
  }

  async findByPatientId(id_patient: string): Promise<Patient | null> {
    try {
      const result = this.db.getFirstSync(`SELECT * FROM ${this.tableName} WHERE id_patient = ?`, [id_patient]);
      return this.modelFactory(result);
    } catch (error) {
      console.error('Error fetching patient by id patient:', error);
      Logger.log('error', 'Error fetching patient by id patient', { error });
      return null;
    }
  }


  public getPatientByConsultationIdOnLocalDB(consultationId: number): Patient | null {
    try {
      const result = this.db.getFirstSync(
        `SELECT p.* FROM ${this.tableName} p
        INNER JOIN consultations c ON c.id_patient = p.id
        WHERE c.id = ?`,
        [consultationId]
      );
      return this.modelFactory(result);
    } catch (error) {
      console.error('Error fetching patient by consultation id:', error);
      Logger.log('error', 'Error fetching patient by consultation id', { error });
      return null;
    }
  }


  public async getDeletedPatientsOnLocalDB(): Promise<Patient[]> {
    try {
      const diabetesType = await getDiabetesType();
      const result = this.db.getAllSync(`SELECT * FROM ${this.tableName} WHERE deletedAt IS NOT NULL AND type_diabete = ?`, [diabetesType.toString()]);

      return result.map((item) => this.modelFactory(item));
    } catch (error) {
      console.error('Error fetching deleted patients:', error);
      Logger.log('error', 'Error fetching deleted patients', { error });
      return [];
    }
  } 


  public async getAllPatientsUpdatedAtIsGreaterThanLastSyncDateOnLocalDB(lastSyncDate: string | null | undefined): Promise<Patient[]> {
    try {
      
      let query = "";
      let params: any[] = [];
      if (!lastSyncDate) {
         query = "SELECT * FROM " + this.tableName + " WHERE type_diabete = ?";
         params = [await getDiabetesType()];
      } else {
        query = "SELECT * FROM " + this.tableName + " WHERE updatedAt >= ? AND type_diabete = ?";
        params = [lastSyncDate, await getDiabetesType()];
      }
      console.log("query", query);
      console.log("params", params);
      const result = this.db.getAllSync(query, params);

      return result.map((item) => this.modelFactory(item));
    } catch (error) {
      console.error('Error fetching updated patients:', error);
      Logger.log('error', 'Error fetching updated patients', { error });
      return [];
    }
  } 


  public async markToSynced(id: number): Promise<void> {
    try {
      this.db.runSync(`UPDATE ${this.tableName} SET updatedAt = ? WHERE id = ?`, [new Date().toISOString(), id]);
    } catch (error) {
      console.error('Error marking patient as synced:', error);
      Logger.log('error', 'Error marking patient as synced', { error });
    }
  }


}
