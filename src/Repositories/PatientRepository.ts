import { getDiabetesType } from '../functions';
import { ConsultationMapper } from '../mappers/consultationMapper';
import { PatientMapper } from '../mappers/patientMapper';
import Patient from '../models/Patient';
import { PatientSyncData, PatientSyncDataResponseOfGetAllMedicalDataServer, PatientSyncPicture } from '../types';
import { checkIfConsultationIsAFicheAdministrative, getFicheAdministrativeName } from '../utils/ficheAdmin';
import Logger from '../utils/Logger';
import { ConsultationRepository } from './ConsultationRepository';
import { GenericRepository } from './GenericRepository';

export class PatientRepository extends GenericRepository<Patient> {
  constructor() {
    super('patients', (data) => new Patient(data), false);
  }

  // Normalise une chaîne pour comparaison: trim, espaces réduits, minuscules, accents supprimés,
  // puis suppression des espaces, des apostrophes et des tirets pour une comparaison tolérante
  private normalizeString(value: string | undefined | null): string {
    if (!value) return '';
    const collapsed = value.replace(/\s+/g, ' ').trim();
    const deAccented = collapsed.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const lower = deAccented.toLowerCase();
    // Retirer espaces, apostrophes (droites et typographiques) et tirets (courts/longs)
    return lower.replace(/[\s'’\-–—]/g, '');
  }

  async findAllByTypeDiabete(type_diabete: string): Promise<Patient[]> {
    try {
      const result = this.db.getAllSync(`SELECT * FROM ${this.tableName} WHERE type_diabete = ? AND deletedAt IS NULL ORDER BY createdAt DESC`, [type_diabete]);
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
      const result = this.db.getAllSync(`SELECT * FROM ${this.tableName} WHERE deletedAt IS NOT NULL AND type_diabete = ? ORDER BY createdAt DESC`, [diabetesType.toString()]);

      return result.map((item) => this.modelFactory(item));
    } catch (error) {
      console.error('Error fetching deleted patients:', error);
      Logger.log('error', 'Error fetching deleted patients', { error });
      return [];
    }
  }


  public async getAllPatientsUpdatedAtIsGreaterThanLastSyncDateOnLocalDB(lastSyncDate: string | null | undefined): Promise<PatientSyncData[]> {
    try {

      let query = "";
      let params: any[] = [];
      if (!lastSyncDate) {
        query = "SELECT * FROM " + this.tableName + " WHERE type_diabete = ? AND deletedAt IS NULL ORDER BY createdAt DESC";
        params = [await getDiabetesType()];
      } else {
        query = "SELECT * FROM " + this.tableName + " WHERE updatedAt >= ? AND type_diabete = ? AND deletedAt IS NULL ORDER BY createdAt DESC";
        params = [lastSyncDate, await getDiabetesType()];
      }
      const result = this.db.getAllSync(query, params);
      const patients = result.map((item) => {
        const patient = this.modelFactory(item);
        return PatientMapper.toPatientSyncData(patient);
      })


      return patients;
    } catch (error) {
      console.error('Error fetching updated patients:', error);
      Logger.log('error', 'Error fetching updated patients', { error });
      return [];
    }
  }


  public async getAllPatientsPicturesUpdatedAtIsGreaterThanLastSyncDateOnLocalDB(lastSyncDate: string | null | undefined): Promise<PatientSyncPicture[]> {
    try {

      let query = "";
      let params: any[] = [];
      if (!lastSyncDate) {
        query = "SELECT * FROM " + this.tableName + " WHERE photo IS NOT NULL AND type_diabete = ? AND deletedAt IS NULL ORDER BY createdAt DESC";
        params = [await getDiabetesType()];
      } else {
        query = "SELECT * FROM " + this.tableName + " WHERE updatedAt >= ? AND photo IS NOT NULL AND type_diabete = ? AND deletedAt IS NULL ORDER BY createdAt DESC";
        params = [lastSyncDate, await getDiabetesType()];
      }
      const result = this.db.getAllSync(query, params);
      const patients = result.map((item) => {
        const patient = this.modelFactory(item);
        return PatientMapper.toPatientSyncPicture(patient);
      })


      return patients;
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

  public async markToSyncedByIdPatient(id_patient: string): Promise<void> {
    try {
      this.db.runSync(`UPDATE ${this.tableName} SET updatedAt = ?,   synced = ? WHERE id_patient = ? AND deletedAt IS NULL`, [new Date().toISOString(), true, id_patient]);
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
        patient.date = new Date(item.generationDate).toISOString() || 'Non Defini';
        patient.type_diabete = await getDiabetesType();
        patient.synced = true;
        patient.isLocalCreated = false;

        if (item.dataConsultations.length > 0) {
          const consultation = item.dataConsultations.find((consultation) => checkIfConsultationIsAFicheAdministrative(ConsultationMapper.DataConsultationOfGetWithPatientGetAllMedicalDataToConsultation(consultation, patient.id_patient, patient.type_diabete)));
          if (consultation) {
            patient.fiche_administrative_name = consultation.form_name;
          } else {
            patient.fiche_administrative_name = await getFicheAdministrativeName() ?? undefined;
          }
        }

        await this.createOrUpdate(patient, 'id_patient');

        const consultationRepository = new ConsultationRepository();
        const consultations = item.dataConsultations.map((consultation) =>
          ConsultationMapper.DataConsultationOfGetWithPatientGetAllMedicalDataToConsultation(
            consultation,
            patient.id_patient,
            patient.type_diabete
          )
        );
        await consultationRepository.createOrUpdateAll(consultations);

        countConsultationsSyncedSuccess += consultations.length;
        totalConsultations += consultations.length;
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

  async deleteAll(ids: string[]): Promise<void> {
    const listIds = ids.map(() => '?').join(',');
    const query = `DELETE FROM ${this.tableName} WHERE id_patient IN (${listIds})`;
    await this.db.runAsync(query, ids);
  }


  async getDoublon(patient: Patient, typeDiabete: string): Promise<Patient[] | null> {
    try {
      // Préparer les valeurs normalisées pour une comparaison robuste
      const normFirst = this.normalizeString(patient.first_name);
      const normLast = this.normalizeString(patient.last_name);

      // SQL minimal et lisible; filtrage avancé effectué côté TS
      const rows = this.db.getAllSync(
        `SELECT * FROM ${this.tableName}
          WHERE type_diabete = ?
          AND date_of_birth = ?
          AND genre = ?
          AND deletedAt IS NULL`,
        [typeDiabete, patient.date_of_birth, patient.genre]
      );
      const candidates = rows.map((item) => this.modelFactory(item));
      const doublons = candidates.filter((p) =>
        this.normalizeString(p.first_name) === normFirst &&
        this.normalizeString(p.last_name) === normLast &&
        p.genre === patient.genre
      );
      return doublons;
    } catch (error) {
      console.error('Error checking if patient is a doublon:', error);
      Logger.log('error', 'Error checking if patient is a doublon', { error });
      return null;
    }
  }


}
