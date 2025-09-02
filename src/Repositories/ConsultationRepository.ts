import { Consultation } from '../models/Consultation';
import { parseConsultationDate } from '../utils/consultation';
import Logger from '../utils/Logger';
import { GenericRepository } from './GenericRepository';

export class ConsultationRepository extends GenericRepository<Consultation> {
  constructor() {
    super('consultations', (data) => new Consultation(data), false);
  }


  public getAllConsultationByPatientIdOnLocalDB(patientId: string): Consultation[] {
    try {
      const result = this.db.getAllSync(`SELECT * FROM ${this.tableName} WHERE id_patient = ?`, [patientId]);
      return result.map((item) => this.modelFactory(item));
    } catch (error) {
      console.error('Error fetching consultations by patient id:', error);
      Logger.log('error', 'Error fetching consultations by patient id', { error });
      return [];
    }
  }


  public getAllConsultationOnLocalDBGroupedByDate(patientId: string, type_diabete: string): Record<string, Consultation[]> {
    try {
      const rows : any[] = this.db.getAllSync(
        `SELECT * FROM ${this.tableName} WHERE id_patient = ? AND type_diabete = ? AND deletedAt IS NULL ORDER BY createdAt ASC`,
        [patientId, type_diabete]
      );

      const grouped: Record<string, Consultation[]> = {};

      for (const row of rows) {
        console.log("row : ", row.date);
        const date = parseConsultationDate((row as Consultation).date || '')?.toISOString().split('T')[0] || 'inconnue';
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(this.modelFactory(row));
      }

      console.log("grouped : ", grouped);

      return grouped;
    } catch (error) {
      console.error('Error fetching consultations grouped by date:', error);
      Logger.log('error', 'Error fetching consultations grouped by date', { error });
      return {};
    }
  }



  async getConsultationsGroupedByPatientOnLocalDB(lastSyncDate: string | null): Promise<{ [id_patient: string]: Consultation[] }> {

    const result: { [id_patient: string]: Consultation[] } = {};
    let rows: Consultation[] = [];
    try {
      if (!lastSyncDate) {
        rows = this.db.getAllSync(
          `SELECT * FROM ${this.tableName} ORDER BY id_patient`
        );
      } else {
        rows = this.db.getAllSync(
          `SELECT * FROM ${this.tableName} WHERE updatedAt >= ? ORDER BY id_patient`,
          [lastSyncDate]
        );
      }

      for (const row of rows) {
        const item = this.modelFactory(row);
        const id = item.id_patient;
        if (!result[id]) result[id] = [];
        result[id].push(item);
      }

      return result;
    } catch (error) {
      console.error('Error fetching consultations grouped by patient:', error);
      Logger.log('error', 'Error fetching consultations grouped by patient', { error });
      return {};
    }
  }



  public markToSynced(id_patient: string): void {
    try {
      this.db.runSync(`UPDATE ${this.tableName} SET synced = ?, updatedAt = ? WHERE id_patient = ?`, [true, new Date().toISOString(), id_patient]);
    } catch (error) {
      console.error('Error marking consultations as synced:', error);
      Logger.log('error', 'Error marking consultations as synced', { error });
    }
  }


  /**
   * Soft delete all consultations for a given patient by setting deletedAt.
   */
  public async softDeleteByPatientId(id_patient: string): Promise<void> {
    try {
      const deletedAt = new Date().toISOString();
      await this.db.runAsync(`UPDATE ${this.tableName} SET deletedAt = ? WHERE id_patient = ?`, [deletedAt, id_patient]);
    } catch (error) {
      console.error('Error soft-deleting consultations by patient id:', error);
      Logger.log('error', 'Error soft-deleting consultations by patient id', { error, id_patient });
    }
  }

  /**
   * Hard delete all consultations for a given patient (irrevocable).
   */
  public async deleteByPatientId(id_patient: string): Promise<void> {
    try {
      await this.db.runAsync(`DELETE FROM ${this.tableName} WHERE id_patient = ?`, [id_patient]);
    } catch (error) {
      console.error('Error hard-deleting consultations by patient id:', error);
      Logger.log('error', 'Error hard-deleting consultations by patient id', { error, id_patient });
    }
  }


  public async createOrUpdateAll(items: Consultation[]): Promise<void> {
    if (!items || items.length === 0) return;
    const db = this.db;
    db.execSync('BEGIN TRANSACTION');
    try {
      for (const item of items) {
        // Upsert basé sur la clé unique 'uuid'
        const existing = db.getFirstSync(
          `SELECT id FROM ${this.tableName} WHERE uuid = ?`,
          [item.uuid]
        );

        if (existing) {
          // Construire dynamiquement l'UPDATE (sans le champ 'id')
          const fields = Object.keys(item).filter((k) => k !== 'id');
          const setters = fields.map((k) => `${k} = ?`).join(', ');
          const values = fields.map((k) => (item as any)[k]);
          values.push(item.uuid);
          const sql = `UPDATE ${this.tableName} SET ${setters} WHERE uuid = ?`;
          db.runSync(sql, values);
        } else {
          // INSERT dynamique en ignorant 'id' et les undefined
          const fields = Object.keys(item).filter(
            (k) => k !== 'id' && (item as any)[k] !== undefined
          );
          const placeholders = fields.map(() => '?').join(',');
          const values = fields.map((k) => (item as any)[k]);
          const insertQuery = `INSERT INTO ${this.tableName} (${fields.join(',')}) VALUES (${placeholders})`;
          db.runSync(insertQuery, values);
        }
      }
      db.execSync('COMMIT');
    } catch (error) {
      console.error('Error creating or updating consultations:', error);
      Logger.log('error', 'Error creating or updating consultations', { error });
      db.execSync('ROLLBACK');
    }
  }






}
