import { getDiabetesType } from '../functions';
import { ConsultationMapper } from '../mappers/consultationMapper';
import { PatientMapper } from '../mappers/patientMapper';
import Patient from '../models/Patient';
import { PatientSyncDataResponseOfGetAllMedicalDataServer } from '../types';
import Logger from '../utils/Logger';
import { ConsultationRepository } from './ConsultationRepository';
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
        query = "SELECT * FROM " + this.tableName + " WHERE updatedAt >= ? AND type_diabete = ? AND deletedAt IS NULL";
        params = [lastSyncDate, await getDiabetesType()];
      }
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
      this.db.runSync(`UPDATE ${this.tableName} SET updatedAt = ?,   synced = ? WHERE id = ? AND deletedAt IS NULL`, [new Date().toISOString(), true, id]);
    } catch (error) {
      console.error('Error marking patient as synced:', error);
      Logger.log('error', 'Error marking patient as synced', { error });
    }
  }


  public async createOrUpdateAll(items: PatientSyncDataResponseOfGetAllMedicalDataServer[]): Promise<void> {
    const totalPatients = items.length;
    let countPatientsSyncedSuccess = 0;
    let countConsultationsSyncedSuccess = 0;
    let totalConsultations = 0;
    try {
      for (const item of items) {
        const patient = PatientMapper.syncResponseToPatient(item);
        patient.createdAt = new Date().toISOString();
        patient.updatedAt = new Date().toISOString();
        patient.type_diabete = await getDiabetesType();
        patient.synced = true;
        patient.isLocalCreated = false;
        await this.createOrUpdate(patient, 'id_patient');

        const consultationRepository = new ConsultationRepository();
        consultationRepository.insertAll(
          item.dataConsultations.map(
            (consultation) => {
              countConsultationsSyncedSuccess++;
              return ConsultationMapper.DataConsultationOfGetWithPatientGetAllMedicalDataToConsultation(consultation,patient.id_patient, patient.type_diabete )
            }
          )
        );

        totalConsultations += item.dataConsultations.length;
        countPatientsSyncedSuccess++;
      }
    } catch (error) {
      console.error('Error creating or updating patients:', error);
      Logger.log('error', 'Error creating or updating patients', { error });
    }
    console.log(`Patients created or updated: ${countPatientsSyncedSuccess}/${totalPatients}`);
    console.log(`Consultations created or updated: ${countConsultationsSyncedSuccess}/${totalConsultations}`);
  }


  public async countPatientsCreatedOrUpdatedSince(date: string, diabetesType: string): Promise<any> {
    return this.db.getFirstSync(`SELECT COUNT(*) as count FROM ${this.tableName} WHERE updatedAt >= ? AND type_diabete = ? AND deletedAt IS NULL `, [date, diabetesType]);
  }


}
